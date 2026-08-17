# אחראי על טעינת מודל ה-AI והמרת טקסטים לווקטורים (Embeddings)

class EmbeddingService:
    def __init__(self, model_name: str = "intfloat/multilingual-e5-small"):
        """אתחול וטעינת מודל ה-Embedding לזיכרון"""
        self.model_name = model_name
        self.model = None

    def load_model(self):
        """טעינת המודל מראש (Lazy loading)"""
        # TODO: טעינת SentenceTransformer או התקשרות ל-API של OpenAI/Dicta
        pass

    def encode_text(self, text: str, is_query: bool = False) -> list[float]:
        """המרה של מחרוזת בודדת (שאילתה או פסקה) לווקטור מספרי"""
        # TODO: החזרת מערך מספרי המייצג את הווקטור (למשל 384 מומדים)
        pass

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """המרה מרוכזת של רשימת פסקאות לווקטורים (לצורך אינדוקס מהיר)"""
        # TODO: עיבוד באצ' של פסקאות
        pass