import os
import json
import re
import httpx
from fastapi import APIRouter, HTTPException, Query
from utils.hebrew import hebrew_to_int, clean_text_formatting
from reader.routers.catalog_router import find_section

router = APIRouter(prefix="/api", tags=["Text"])

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "../../search_engine/raw_data")

def extract_start_unit(section_name: str) -> int:
    """חילוץ סימן/פרק ההתחלה מתוך שם החטיבה בקטלוג"""
    match_bracket = re.search(r'\(([\u05D0-\u05EA]+)(?:-[\u05D0-\u05EA]+)?\)', section_name)
    if match_bracket:
        val = hebrew_to_int(match_bracket.group(1))
        if val > 0:
            return val

    match_unit = re.search(r'(?:פרקי?ם?|סימני?ם?)\s+([\u05D0-\u05EA]+)', section_name)
    if match_unit:
        val = hebrew_to_int(match_unit.group(1))
        if val > 0:
            return val

    return 1

def get_text_from_local_json(base_ref: str, actual_unit: int) -> list[str] | None:
    """שליפת הטקסט מקובץ JSON מקומי מתוך raw_data"""
    file_path = os.path.join(RAW_DATA_DIR, f"{base_ref}.json")
    if not os.path.exists(file_path):
        return None

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        text_data = data.get("text", [])
        if not text_data:
            return None

        unit_idx = actual_unit - 1
        if 0 <= unit_idx < len(text_data):
            unit_paragraphs = text_data[unit_idx]
            if isinstance(unit_paragraphs, str):
                unit_paragraphs = [unit_paragraphs]
            return [clean_text_formatting(p) for p in unit_paragraphs if p]
    except Exception as e:
        print(f"Error reading local file {file_path}: {e}")
    
    return None

@router.get("/text")
@router.get("/section")
@router.get("/reader/text")
@router.get("/text/{book_id}/{section_id}")
@router.get("/text/{book_id}/{section_id}/{unit_path}")
async def get_text_section(
    book_id: str | None = None,
    section_id: str | None = None,
    unit_path: int | None = None,
    sub_book: str | None = Query(None),
    section: str | None = Query(None),
    unit: int | None = Query(None),
    chapter: int | None = Query(None),
    siman: int | None = Query(None),
    page: int | None = Query(None),
    ref: str | None = Query(None)
):
    target_section = section_id or section or sub_book or ref
    raw_unit = unit_path or unit or chapter or siman or page or 1

    book, sec_meta = find_section(book_id, target_section)

    if not sec_meta:
        raise HTTPException(status_code=404, detail="החטיבה המבוקשת לא נמצאה בקטלוג")

    base_ref = sec_meta["base_ref"]
    section_name = sec_meta.get("name", "")

    start_unit = extract_start_unit(section_name)
    actual_unit = (start_unit + raw_unit - 1) if raw_unit < start_unit else raw_unit

    # 1. ניסיון שליפה מקומית מהדיסק (Offline-First)
    local_paragraphs = get_text_from_local_json(base_ref, actual_unit)
    if local_paragraphs is not None:
        return {
            "ref": f"{base_ref}.{actual_unit}",
            "sections": local_paragraphs,
            "text": local_paragraphs,
            "paragraphs": local_paragraphs,
            "source": "local"
        }

    # 2. גיבוי אסינכרוני מול Sefaria API אם הקובץ לא קיים ב-raw_data
    url = f"https://www.sefaria.org/api/v3/texts/{base_ref}.{actual_unit}?context=0"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            if res.status_code != 200:
                url_alt = f"https://www.sefaria.org/api/v3/texts/{base_ref} {actual_unit}?context=0"
                res = await client.get(url_alt)

            if res.status_code == 200:
                data = res.json()
                versions = data.get("versions", [])
                hebrew_version = next((v for v in versions if v.get("language") == "he"), None)
                if not hebrew_version and versions:
                    hebrew_version = versions[0]

                paragraphs = hebrew_version.get("text", []) if hebrew_version else []
                if isinstance(paragraphs, str):
                    paragraphs = [paragraphs]

                cleaned_paragraphs = [clean_text_formatting(p) for p in paragraphs if p]

                return {
                    "ref": f"{base_ref}.{actual_unit}",
                    "sections": cleaned_paragraphs,
                    "text": cleaned_paragraphs,
                    "paragraphs": cleaned_paragraphs,
                    "source": "network"
                }
            else:
                raise HTTPException(status_code=res.status_code, detail="הטקסט לא נמצא בספריא")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))