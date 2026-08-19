import re
import requests
from fastapi import APIRouter, HTTPException, Query
from utils.hebrew import hebrew_to_int, clean_text_formatting
from reader.routers.catalog_router import find_section

router = APIRouter(prefix="/api", tags=["Text"])

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

@router.get("/text")
@router.get("/section")
@router.get("/reader/text")
@router.get("/text/{book_id}/{section_id}")
@router.get("/text/{book_id}/{section_id}/{unit_path}")
def get_text_section(
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

    if raw_unit < start_unit:
        actual_unit = start_unit + raw_unit - 1
    else:
        actual_unit = raw_unit

    url = f"https://www.sefaria.org/api/v3/texts/{base_ref}.{actual_unit}?context=0"

    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            url_alt = f"https://www.sefaria.org/api/v3/texts/{base_ref} {actual_unit}?context=0"
            res = requests.get(url_alt, timeout=10)

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
                "paragraphs": cleaned_paragraphs
            }
        else:
            raise HTTPException(status_code=res.status_code, detail="הטקסט לא נמצא בספריא")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))