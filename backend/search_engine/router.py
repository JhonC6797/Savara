# Router המנהל את נקודת הקצה של החיפוש עבור ה-Frontend

from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("")
async def search_texts(q: str = Query(..., min_length=2, description="שאילתת חיפוש חופשית")):
    """
    מקבל שאילתת טקסט חופשית, ממיר לווקטור, ומחזיר את 3 הפסקאות הרלוונטיות ביותר
    """
    # 1. המרת השאילתה לווקטור דרך embedding_service
    # 2. חיפוש הווקטור ב-vector_db_service
    # 3. החזרת רשימת התוצאות עם ה-ref וה-score
    return []