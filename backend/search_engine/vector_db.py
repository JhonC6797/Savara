# אחראי על הדיבור מול בסיס הנתונים הווקטורי (Qdrant/LanceDB)

class VectorDBService:
    def __init__(self, db_path: str, collection_name: str = "svara_texts"):
        self.db_path = db_path
        self.collection_name = collection_name
        self.client = None

    def connect(self):
        """התחברות למאגר הנתונים המקומי על הדיסק"""
        # TODO: אתחול client מול התיקייה המקומית
        pass

    def init_collection(self, vector_size: int = 384):
        """יצירת קולקשן (טבלה וקטורית) במידה ואינו קיים"""
        # TODO: הגדרת גודל וקטור ומטריקת דמיון (Cosine Similarity)
        pass

    def upsert_points(self, points_data: list[dict]):
        """שמירת וקטורים יחד עם המטא-דאטה (טקסט, ref, ספר) במאגר"""
        # TODO: הכנסה/עדכון של הנתונים במאגר
        pass

    def search(self, query_vector: list[float], limit: int = 3) -> list[dict]:
        """חיפוש הווקטורים הקרובים ביותר לווקטור השאילתה"""
        # TODO: הרצת שאילתת Similarity והחזרת Top-N תוצאות
        pass