from fastembed import TextEmbedding

class EmbeddingService:
    def __init__(self, model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.model_name = model_name
        self.model = None

    def get_model(self):
        if not self.model:
            self.model = TextEmbedding(model_name=self.model_name)
        return self.model

    def get_embeddings(self, texts: list) -> list:
        model = self.get_model()
        embeddings = list(model.embed(texts))
        return [e.tolist() for e in embeddings]

    def get_query_embedding(self, query: str) -> list:
        model = self.get_model()
        embedding = list(model.embed([query]))[0]
        return embedding.tolist()

    # תמיכה בשימוש מתוך ה-API כולל is_query ופרמטרים נוספים
    def encode_text(self, text: str, is_query: bool = False, **kwargs) -> list:
        if is_query:
            return self.get_query_embedding(text)
        return self.get_embeddings([text])[0] if isinstance(text, str) else self.get_embeddings(text)