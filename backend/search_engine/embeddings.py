from fastembed import TextEmbedding
from typing import List, Union

class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls) -> TextEmbedding:
        if cls._model is None:
            # מודל מהיר ורזה (~100MB RAM) הפועל ללא PyTorch
            cls._model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return cls._model

    def encode_text(self, text: str, is_query: bool = True) -> List[float]:
        """המרת טקסט יחיד לווקטור (עבור שאילתות חיפוש)"""
        model = self.get_model()
        embeddings = list(model.embed([text]))
        return embeddings[0].tolist() if embeddings else []

    def get_embeddings(self, texts: Union[str, List[str]]) -> List[List[float]]:
        """המרת רשימת טקסטים לווקטורים"""
        if isinstance(texts, str):
            texts = [texts]
        model = self.get_model()
        embeddings = list(model.embed(texts))
        return [e.tolist() for e in embeddings]