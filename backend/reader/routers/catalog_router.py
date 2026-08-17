# backend/reader/catalog_router.py
from fastapi import APIRouter, HTTPException, Query
from reader.data.catalog import CATALOG
import requests

router = APIRouter(prefix="/api", tags=["Reader"])

def get_section_meta(book_id: str, section_id: str):
    """סריקה היררכית בקטלוג למציאת החטיבה והספר"""
    for book in CATALOG:
        if book["id"] == book_id:
            for cat in book.get("categories", []):
                for sec in cat.get("sections", []):
                    if sec["id"] == section_id:
                        return book, sec
    return None, None

@router.get("/catalog")
def get_catalog():
    return CATALOG

@router.get("/text/{book_id}/{section_id}")
def get_text_section(book_id: str, section_id: str, unit: int = Query(1, ge=1)):
    book, section = get_section_meta(book_id, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="החטיבה המבוקשת לא נמצאה בקטלוג")

    base_ref = section["base_ref"]
    url = f"https://www.sefaria.org/api/v3/texts/{base_ref}.{unit}?context=0"
    
    try:
        res = requests.get(url)
        if res.status_code == 200:
            data = res.json()
            versions = data.get("versions", [])
            hebrew_version = next((v for v in versions if v.get("language") == "he"), None)
            paragraphs = hebrew_version.get("text", []) if hebrew_version else []
            
            if isinstance(paragraphs, str):
                paragraphs = [paragraphs]
                
            return {
                "ref": f"{base_ref}.{unit}",
                "sections": paragraphs
            }
        else:
            raise HTTPException(status_code=res.status_code, detail="הטקסט לא נמצא בספריא")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))