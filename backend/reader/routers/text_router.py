# backend/reader/routers/text_router.py
import re
import requests
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Query
from reader.data.catalog import CATALOG

router = APIRouter(prefix="/api", tags=["Text"])

def clean_text(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'<[^>]+>', '', text)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def get_section_meta(book_id: str, section_id: str):
    for book in CATALOG:
        if book["id"] == book_id:
            for cat in book.get("categories", []):
                for sec in cat.get("sections", []):
                    if sec["id"] == section_id:
                        return book, sec
    return None, None

@router.get("/text/{book_id}/{section_id}")
def get_text_section(book_id: str, section_id: str, unit: int = Query(1, ge=1)):
    book, section = get_section_meta(book_id, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="החטיבה המבוקשת לא נמצאה בקטלוג")

    base_ref = section["base_ref"]
    raw_ref = f"{base_ref}.{unit}"
    
    # ניסיון פנייה ישירה
    encoded_ref = quote(raw_ref)
    url = f"https://www.sefaria.org/api/texts/{encoded_ref}?context=0&commentary=0"
    
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            raw_paragraphs = data.get("he", [])
            
            if isinstance(raw_paragraphs, str):
                raw_paragraphs = [raw_paragraphs]
                
            cleaned_paragraphs = [clean_text(p) for p in raw_paragraphs if p]
            
            if cleaned_paragraphs:
                return {
                    "ref": raw_ref,
                    "sections": cleaned_paragraphs
                }
        
        # הדפסת דיבאג לטרמינל במידה ונכשל
        print(f"[Sefaria Fetch Error] URL failed: {url} | Status: {res.status_code}")
        raise HTTPException(status_code=404, detail=f"הטקסט עבור {raw_ref} לא נמצא בספריא")
        
    except Exception as e:
        print(f"[Sefaria Exception] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))