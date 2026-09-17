import httpx
from fastapi import APIRouter, HTTPException, Query

from search_engine.corpus import find_section, unit_paragraphs
from utils.hebrew import clean_text_formatting

router = APIRouter(prefix="/api", tags=["Text"])


async def fetch_from_sefaria(base_ref: str, unit: int) -> list[str]:
    url = f"https://www.sefaria.org/api/v3/texts/{base_ref}.{unit}?context=0"
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(url)
        if res.status_code != 200:
            res = await client.get(f"https://www.sefaria.org/api/v3/texts/{base_ref} {unit}?context=0")
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="הטקסט לא נמצא בספריא")

        versions = res.json().get("versions", [])
        hebrew = next((v for v in versions if v.get("language") == "he"), None) or (versions[0] if versions else None)
        paragraphs = hebrew.get("text", []) if hebrew else []
        if isinstance(paragraphs, str):
            paragraphs = [paragraphs]
        return [p for p in (clean_text_formatting(p) for p in paragraphs) if p]


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
):
    target = section_id or section or sub_book
    meta = find_section(book_id, target)
    if not meta:
        raise HTTPException(status_code=404, detail="החטיבה המבוקשת לא נמצאה בקטלוג")

    # החטיבה מכסה טווח מוחלט (למשל הלכות תפילין = סימנים כה-מה), ולכן פנייה
    # ליחידה 1 מתוך הקטלוג מתורגמת ליחידה הראשונה בטווח.
    requested = unit_path or unit or chapter or siman or page or meta["start_unit"]
    actual_unit = min(max(requested, meta["start_unit"]), meta["end_unit"])

    base_ref = meta["base_ref"]
    paragraphs = unit_paragraphs(base_ref, actual_unit)
    source = "local"
    if not paragraphs:
        paragraphs = await fetch_from_sefaria(base_ref, actual_unit)
        source = "network"

    return {
        "ref": f"{base_ref}.{actual_unit}",
        "sections": paragraphs,
        "unit": actual_unit,
        "start_unit": meta["start_unit"],
        "end_unit": meta["end_unit"],
        "unit_label": meta["unit_label"],
        "source": source,
    }
