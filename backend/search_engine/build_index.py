"""בונה את אינדקס החיפוש (SQLite FTS5) מתוך raw_data, מונחה על ידי הקטלוג.

הרצה:  python -m search_engine.build_index
"""
import hashlib
import os
import sqlite3
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from search_engine.corpus import iter_sections, load_source, unit_paragraphs
from utils.hebrew import loose_form

INDEX_PATH = os.path.join(BASE_DIR, "search_index.db")


def build_rows():
    sections = list(iter_sections())
    by_ref = {}
    for section in sections:
        by_ref.setdefault(section["base_ref"], []).append(section)

    rows = []
    seen = set()
    missing_files = []
    empty_sections = []

    for base_ref, group in by_ref.items():
        if load_source(base_ref) is None:
            missing_files.append(base_ref)
            continue

        for section in group:
            count = 0
            for unit in range(section["start_unit"], section["end_unit"] + 1):
                for position, body in enumerate(unit_paragraphs(base_ref, unit) or [], start=1):
                    digest = hashlib.md5(body.encode("utf-8")).hexdigest()
                    if digest in seen:
                        continue
                    seen.add(digest)
                    rows.append((
                        f"{base_ref}.{unit}.{position}",
                        section["book_id"],
                        section["section_id"],
                        unit,
                        position,
                        section["book_title"],
                        section["section_name"],
                        section["unit_label"],
                        body,
                        loose_form(body),
                    ))
                    count += 1
            if count == 0:
                empty_sections.append(f'{section["book_id"]}/{section["section_id"]}')

    return rows, missing_files, empty_sections


def write_index(rows):
    if os.path.exists(INDEX_PATH):
        os.remove(INDEX_PATH)
    con = sqlite3.connect(INDEX_PATH)
    con.execute("""
        CREATE VIRTUAL TABLE docs USING fts5(
            ref UNINDEXED, book_id UNINDEXED, section_id UNINDEXED,
            unit UNINDEXED, paragraph UNINDEXED,
            book_title UNINDEXED, section_name UNINDEXED, unit_label UNINDEXED,
            body, body_loose,
            tokenize='unicode61'
        )
    """)
    con.executemany("INSERT INTO docs VALUES (?,?,?,?,?,?,?,?,?,?)", rows)
    con.execute("INSERT INTO docs(docs) VALUES('optimize')")
    con.commit()
    con.close()


def main():
    rows, missing_files, empty_sections = build_rows()
    write_index(rows)

    print(f"נאנדקסו {len(rows)} פסקאות -> {INDEX_PATH}")
    print(f"גודל: {os.path.getsize(INDEX_PATH) / 1e6:.1f} MB")
    if missing_files:
        print(f"\nחסרים {len(missing_files)} קבצי מקור:")
        for ref in missing_files:
            print(f"  - {ref}")
    if empty_sections:
        print(f"\n{len(empty_sections)} חטיבות ללא תוכן:")
        for name in empty_sections:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
