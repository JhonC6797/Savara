# backend/search_engine/embeddings.py
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self, model_name: str = "intfloat/multilingual-e5-small"):
        self.model_name = model_name
        self.model = None

    def load_model(self):
        if not self.model:
            self.model = SentenceTransformer(self.model_name)

    def encode_text(self, text: str, is_query: bool = True) -> list:
        if not self.model:
            self.load_model()
        # מודל E5 דורש קידומת query: בשאילתות
        prefix = "query: " if is_query else "passage: "
        formatted_text = f"{prefix}{text}"
        return self.model.encode(formatted_text).tolist()

    def encode_batch(self, texts: list) -> list:
        if not self.model:
            self.load_model()
        formatted_texts = [f"passage: {t}" for t in texts]
        return self.model.encode(formatted_texts).tolist()