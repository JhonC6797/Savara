from fastapi import APIRouter, HTTPException
from services.sefaria_service import fetch_text_from_sefaria

router = APIRouter(prefix="/api/text", tags=["Text"])

@router.get("/{ref:path}")
async def get_text(ref: str):
    data = await fetch_text_from_sefaria(ref)
    if not data:
        raise HTTPException(status_code=404, detail="הטקסט לא נמצא")
    return data