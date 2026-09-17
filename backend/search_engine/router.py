import os
import re
import sqlite3
from functools import lru_cache

from fastapi import APIRouter, HTTPException, Query

from utils.hebrew import int_to_hebrew, loose_form

router = APIRouter(prefix="/api", tags=["Search"])

INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "search_index.db")

MAX_QUERY_CHARS = 300
SNIPPET_OPEN = "«"
SNIPPET_CLOSE = "»"

_connection = None


def get_connection():
    global _connection
    if _connection is None:
        if not os.path.exists(INDEX_PATH):
            raise HTTPException(
                status_code=503,
                detail="אינדקס החיפוש לא נבנה. הרץ: python -m search_engine.build_index",
            )
        _connection = sqlite3.connect(f"file:{INDEX_PATH}?mode=ro", uri=True, check_same_thread=False)
    return _connection


def tokenize(text: str) -> list[str]:
    """פירוק לשאילתה לטוקנים נקיים. מסיר כל תו שאינו אות או ספרה, ולכן
    מנטרל גם את תווי התחביר של FTS5 ומונע הזרקת שאילתות."""
    return [w for w in re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE).split() if len(w) > 1]


def fts_phrase(tokens: list[str]) -> str:
    return '"' + " ".join(tokens) + '"'


def fts_all(tokens: list[str]) -> str:
    return " AND ".join(f'"{t}"' for t in tokens)


def fts_any(tokens: list[str]) -> str:
    return " OR ".join(f'"{t}"' for t in tokens)


def build_ladder(q: str) -> list[tuple[str, str, str]]:
    """סולם ההסלמה: מהתאמה מדויקת ועד התאמה חלקית.

    כל שלב הוא (סוג ההתאמה, עמודה, ביטוי FTS5). מפסיקים בשלב הראשון
    שמחזיר תוצאות, כך שציטוט מדויק לעולם לא נקבר תחת התאמות רופפות.
    """
    tokens = tokenize(q)
    if not tokens:
        return []

    loose = tokenize(loose_form(q))
    ladder = [("exact", "body", fts_phrase(tokens))]
    if len(tokens) > 1:
        ladder.append(("all_words", "body", fts_all(tokens)))
    if loose:
        if len(loose) > 1:
            ladder.append(("all_words_loose", "body_loose", fts_all(loose)))
        ladder.append(("partial", "body_loose", fts_any(loose)))
    return ladder


def display_title(row: sqlite3.Row) -> str:
    unit = int_to_hebrew(row["unit"])
    paragraph = int_to_hebrew(row["paragraph"])
    label = row["unit_label"]
    inner_label = "סעיף" if label == "סימן" else "הלכה"
    return f'{row["book_title"]}, {row["section_name"]} - {label} {unit} {inner_label} {paragraph}'


@lru_cache(maxsize=256)
def run_search(q: str, book_id: str, limit: int) -> dict:
    connection = get_connection()
    connection.row_factory = sqlite3.Row

    for match_type, column, expression in build_ladder(q):
        match = f"{column}:({expression})"
        sql = (
            "SELECT ref, book_id, section_id, unit, paragraph, book_title, section_name, unit_label,"
            f" snippet(docs, 8, '{SNIPPET_OPEN}', '{SNIPPET_CLOSE}', '…', 18) AS snippet,"
            " bm25(docs) AS rank FROM docs WHERE docs MATCH ?"
        )
        params: list = [match]
        if book_id and book_id != "all":
            sql += " AND book_id = ?"
            params.append(book_id)
        sql += " ORDER BY rank LIMIT ?"
        params.append(limit)

        rows = connection.execute(sql, params).fetchall()
        if not rows:
            continue

        return {
            "query": q,
            "match_type": match_type,
            "count": len(rows),
            "results": [
                {
                    "ref": row["ref"],
                    "display_title": display_title(row),
                    "snippet": row["snippet"],
                    "nav": {
                        "book_id": row["book_id"],
                        "section_id": row["section_id"],
                        "unit": row["unit"],
                        "paragraph": row["paragraph"],
                    },
                }
                for row in rows
            ],
        }

    return {"query": q, "match_type": "none", "count": 0, "results": []}


@router.get("/search")
def search(
    q: str = Query(..., min_length=2, max_length=MAX_QUERY_CHARS),
    book_id: str = Query("all"),
    limit: int = Query(20, ge=1, le=50),
):
    return run_search(q.strip(), book_id, limit)
