# backend/search_engine/vector_db.py
from qdrant_client import QdrantClient
from qdrant_client.http import models

class VectorDBService:
    def __init__(self, path="./qdrant_db"):
        self.client = QdrantClient(path=path)
        self.collection_name = "torah_texts"

    def init_collection(self, vector_size=384):
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE)
            )

    def upsert_points(self, points: list):
        qdrant_points = [
            models.PointStruct(id=p["id"], vector=p["vector"], payload=p["payload"])
            for p in points
        ]
        self.client.upsert(collection_name=self.collection_name, points=qdrant_points)

    def search(self, query_vector: list, limit: int = 5, book_id: str = None):
        query_filter = None
        if book_id and book_id != "all":
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="book_id",
                        match=models.MatchValue(value=book_id)
                    )
                ]
            )

        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit
        )

        results = []
        for hit in search_result:
            results.append({
                "score": round(hit.score * 100, 1),
                "payload": hit.payload
            })
        return results