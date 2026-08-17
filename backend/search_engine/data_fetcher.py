# backend/search_engine/data_fetcher.py
import os
import requests

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "raw_data")
BOOKS_INDEX_URL = "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/books.json"

def download_catalog_texts(catalog: list):
    """הורדת קובצי ה-JSON המלאים של כל הספרים בקטלוג לתיקייה מקומית"""
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    
    print("מושך את אינדקס הספרים הראשי של Sefaria-Export...")
    response = requests.get(BOOKS_INDEX_URL)
    response.raise_for_status()
    all_books_metadata = response.json().get("books", [])

    # מיפוי שמות הספרים בקטלוג לקישורי ההורדה ב-GitHub
    for book in catalog:
        for section in book["sections"]:
            base_ref = section["base_ref"]
            # ניקוי תת-חלקים (כמו Part 1 או .Introduction) להתאמה מדויקת מול האינדקס
            clean_title = base_ref.split(",")[0].split(".")[0].replace("_", " ")
            local_file_path = os.path.join(RAW_DATA_DIR, f"{base_ref}.json")

            if os.path.exists(local_file_path):
                print(f"הקובץ {base_ref}.json כבר קיים מקומית. מדלג...")
                continue

            # חיפוש ה-JSON המתאים באינדקס
            matched_url = None
            for meta in all_books_metadata:
                if meta.get("title") == clean_title and meta.get("language") == "Hebrew":
                    matched_url = meta.get("json_url")
                    break

            if matched_url:
                print(f"מוריד אופליין: {clean_title} ({base_ref})...")
                res = requests.get(matched_url)
                if res.status_code == 200:
                    with open(local_file_path, "w", encoding="utf-8") as f:
                        f.write(res.text)
                    print(f"נשמר בהצלחה: {local_file_path}")
                else:
                    print(f"שגיאה בהורדת {clean_title}: סטטוס {res.status_code}")
            else:
                print(f"אזהרה: לא נמצא קישור JSON עבור {clean_title}")

if __name__ == "__main__":
    from reader.data.catalog import CATALOG
    download_catalog_texts(CATALOG)