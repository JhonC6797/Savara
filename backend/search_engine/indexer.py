import os
import sys
import json
import re

# הוספת תיקיית backend ל-sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.search_engine.embedding_service import EmbeddingService
from search_engine.vector_db import VectorDBService
from search_engine.bm25_service import BM25Service


def get_master_book_id(file_name: str, raw_id: str) -> str:
    """מיפוי שמות הקבצים למזהי הקטלוג הראשיים"""
    combined = f"{file_name} {raw_id}".lower()
    if "mishneh" in combined or "rambam" in combined:
        return "mishneh_torah"
    elif "shulchan" in combined or "arukh" in combined:
        return "shulchan_arukh"
    elif "guide" in combined or "perplexed" in combined or "moreh" in combined:
        return "guide_for_the_perplexed"
    elif "mesillat" in combined or "yesharim" in combined:
        return "mesillat_yesharim"
    return raw_id.lower().replace(" ", "_")


def clean_text(text: str) -> str:
    """הסרת תגיות HTML ורווחים כפולים"""
    if not text:
        return ""
    cleaned = re.sub(r'<[^>]+>', '', text)
    return ' '.join(cleaned.split())


def extract_paragraphs_from_file(book_data):
    """חילוץ פסקאות גמיש ונקי"""
    if isinstance(book_data, dict) and "sections" in book_data:
        for s_idx, section in enumerate(book_data["sections"]):
            sec_name = section.get("name", f"פרק {s_idx + 1}")
            paragraphs = section.get("paragraphs", section.get("text", []))
            if isinstance(paragraphs, list):
                for p_idx, p_text in enumerate(paragraphs):
                    if isinstance(p_text, str):
                        cleaned = clean_text(p_text)
                        if cleaned:
                            yield sec_name, p_idx, cleaned
        return

    text_data = book_data.get("text", []) if isinstance(book_data, dict) else book_data

    def flatten(data, prefix=""):
        if isinstance(data, str):
            cleaned = clean_text(data)
            if cleaned:
                yield prefix, cleaned
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                sec_label = f"{prefix} אות {idx+1}" if prefix else f"פרק {idx+1}"
                yield from flatten(item, sec_label)

    p_idx = 0
    for sec_name, p_text in flatten(text_data):
        yield sec_name, p_idx, p_text
        p_idx += 1


def run_offline_indexer():
    print("--- שלב 1: טעינת מנועים ---")
    embedding_service = EmbeddingService()
    vector_db = VectorDBService()
    bm25_service = BM25Service()

    vector_db.init_collection()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(base_dir, "raw_data")

    if not os.path.exists(raw_data_dir):
        print(f"שגיאה: תיקיית הנתונים {raw_data_dir} לא נמצאה.")
        return

    all_points = []
    all_bm25_docs = []
    point_id = 1

    print("--- שלב 2: עיבוד הקבצים ומשויך לקטגוריות ---")
    json_files = [f for f in os.listdir(raw_data_dir) if f.endswith(".json")]

    for file_name in json_files:
        file_path = os.path.join(raw_data_dir, file_name)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                book_data = json.load(f)
        except Exception:
            continue

        raw_id = book_data.get("book_id", file_name.replace(".json", "")) if isinstance(book_data, dict) else file_name.replace(".json", "")
        
        # גזירת מזהה הספר הראשי (למשל: mishneh_torah)
        master_book_id = get_master_book_id(file_name, raw_id)
        book_title = book_data.get("title", raw_id) if isinstance(book_data, dict) else raw_id

        file_paragraphs = 0
        for sec_name, p_idx, p_text in extract_paragraphs_from_file(book_data):
            payload = {
                "book_id": master_book_id,  # שיוך למזהה הקטלוג הראשי
                "sub_book_title": book_title,
                "book_title": book_title,
                "section_name": sec_name,
                "paragraph_idx": p_idx,
                "text": p_text,
            }

            full_searchable_text = f"{book_title} {sec_name} {p_text}"

            # 1. BM25
            all_bm25_docs.append({
                "text": full_searchable_text,
                "payload": payload
            })

            # 2. Vector DB
            vector = embedding_service.encode_text(full_searchable_text, is_query=False)
            all_points.append({
                "id": point_id,
                "vector": vector,
                "payload": payload
            })
            point_id += 1
            file_paragraphs += 1

        if file_paragraphs > 0:
            print(f"מאונדקס: {book_title} -> [קטגוריה: {master_book_id}] ({file_paragraphs} פסקאות)")

    print(f"\n--- שלב 3: שמירת האינדקסים ({len(all_points)} פסקאות) ---")

    print("שומר פסקאות ב-Vector DB...")
    vector_db.upsert_points(all_points)

    print("בונה אינדקס BM25 מילולי (bm25_index.pkl)...")
    bm25_service.build_index(all_bm25_docs)

    print("תהליך האינדוקס הושלם בהצלחה!")


if __name__ == "__main__":
    run_offline_indexer()