# backend/search_engine/indexer.py
import os
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reader.data.catalog import CATALOG
from reader.services.sefaria_service import clean_html
from search_engine.data_fetcher import download_catalog_texts, RAW_DATA_DIR
from search_engine.embeddings import EmbeddingService
from search_engine.vector_db import VectorDBService

def parse_jagged_array(text_structure, current_unit=1):
    """פירוק היררכי של טקסט ספריא (1D, 2D או 3D) לרשימה שטוחה של יחידות ופסקאות"""
    paragraphs = []

    # אם המבנה הוא רשימה של פרקים (2D Array)
    if isinstance(text_structure, list) and len(text_structure) > 0 and isinstance(text_structure[0], list):
        for unit_idx, unit_content in enumerate(text_structure):
            unit_num = unit_idx + 1
            if isinstance(unit_content, list):
                for p_idx, p_text in enumerate(unit_content):
                    if isinstance(p_text, str) and p_text.strip():
                        paragraphs.append((unit_num, p_idx + 1, clean_html(p_text)))
    # אם המבנה הוא פרק בודד/פסקאות בודדות (1D Array)
    elif isinstance(text_structure, list):
        for p_idx, p_text in enumerate(text_structure):
            if isinstance(p_text, str) and p_text.strip():
                paragraphs.append((current_unit, p_idx + 1, clean_html(p_text)))

    return paragraphs

def run_offline_indexer():
    # 1. הורדת קובצי ה-JSON המלאים אופליין
    print("--- שלב 1: בדיקת קובצי Bulk Data מקומיים ---")
    download_catalog_texts(CATALOG)

    # 2. אתחול מודל ה-AI וה-Vector DB
    print("\n--- שלב 2: טעינת מודל ה-Embedding וה-Vector DB ---")
    embedding_service = EmbeddingService()
    embedding_service.load_model()

    vector_db = VectorDBService()
    vector_db.init_collection(vector_size=384)

    all_points = []
    point_id = 1

    # 3. עיבוד הקבצים המקומיים בלבד
    print("\n--- שלב 3: אינדוקס אופליין מלא ---")
    for book in CATALOG:
        for section in book["sections"]:
            base_ref = section["base_ref"]
            file_path = os.path.join(RAW_DATA_DIR, f"{base_ref}.json")

            if not os.path.exists(file_path):
                print(f"דילוג: קובץ לא נמצא {file_path}")
                continue

            print(f"מעבד מקומית: {book['title']} - {section['name']}...")
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            raw_text = data.get("text", [])
            parsed_paragraphs = parse_jagged_array(raw_text)

            if not parsed_paragraphs:
                continue

            texts_only = [p[2] for p in parsed_paragraphs]
            vectors = embedding_service.encode_batch(texts_only)

            for (unit_num, p_num, text), vector in zip(parsed_paragraphs, vectors):
                ref = base_ref if section.get("is_single") else f"{base_ref}.{unit_num}"
                
                all_points.append({
                    "id": point_id,
                    "vector": vector,
                    "payload": {
                        "book_id": book["id"],
                        "section_id": section["id"],
                        "book_title": book["title"],
                        "section_name": section["name"],
                        "unit_number": unit_num,
                        "paragraph_number": p_num,
                        "ref": ref,
                        "text": text
                    }
                })
                point_id += 1

    print(f"\nשומר {len(all_points)} פסקאות מאונדקסות ב-Vector DB...")
    vector_db.upsert_points(all_points)
    print("תהליך האינדוקס האופליין הושלם בהצלחה מלאה!")

if __name__ == "__main__":
    run_offline_indexer()