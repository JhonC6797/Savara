from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from search_engine.embeddings import EmbeddingService
from search_engine.vector_db import VectorDBService

router = APIRouter(prefix="/api/search", tags=["Search"])

embedding_service = EmbeddingService()
vector_db = VectorDBService()

@router.get("")
async def search_texts(
    q: str = Query(..., min_length=2),
    book_id: Optional[str] = Query(None)
):
    try:
        query_vector = embedding_service.encode_text(q, is_query=True)
        results = vector_db.search(query_vector=query_vector, limit=5, book_id=book_id)
        return results
    except Exception as e:
        print("Search error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))