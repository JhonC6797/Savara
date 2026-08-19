from fastapi import APIRouter
from reader.data.catalog import CATALOG

router = APIRouter(prefix="/api", tags=["Catalog"])

def find_section(book_id: str | None, section_id: str | None):
    """חיפוש גמיש במיוחד לזיהוי הספר והחטיבה לפי מזהה, שם בעברית או באנגלית"""
    if not section_id:
        return None, None

    sec_clean = str(section_id).lower().strip()
    book_clean = str(book_id).lower().strip() if book_id else ""

    for book in CATALOG:
        b_id = str(book.get("id", "")).lower()
        b_title = str(book.get("title", "")).lower()

        if not book_clean or book_clean == "all" or b_id == book_clean or book_clean in b_id or book_clean in b_title:
            for cat in book.get("categories", []):
                for sec in cat.get("sections", []):
                    s_id = str(sec.get("id", "")).lower()
                    s_name = str(sec.get("name", "")).lower()
                    s_ref = str(sec.get("base_ref", "")).lower()

                    if sec_clean in [s_id, s_name, s_ref] or sec_clean in s_id or sec_clean in s_name or s_id in sec_clean or sec_clean in s_ref:
                        return book, sec

    for book in CATALOG:
        for cat in book.get("categories", []):
            for sec in cat.get("sections", []):
                s_id = str(sec.get("id", "")).lower()
                s_name = str(sec.get("name", "")).lower()
                s_ref = str(sec.get("base_ref", "")).lower()

                if sec_clean in [s_id, s_name, s_ref] or sec_clean in s_id or sec_clean in s_name or s_id in sec_clean or sec_clean in s_ref:
                    return book, sec

    return None, None

@router.get("/catalog")
def get_catalog():
    return CATALOG

@router.get("/catalog/{book_id}")
@router.get("/books/{book_id}")
@router.get("/book/{book_id}")
def get_book_by_id(book_id: str):
    target = book_id.lower().replace("-", "_").replace(" ", "_")
    for book in CATALOG:
        if book.get("id", "").lower() == target or target in book.get("id", "").lower():
            return book
    return {}