# סקריפט ETL המורץ אופליין באופן יזום לבניית האינדקס

class ETLIndexer:
    def __init__(self, catalog: list, embedding_service, vector_db_service):
        self.catalog = catalog
        self.embedding_service = embedding_service
        self.vector_db_service = vector_db_service

    async def fetch_and_chunk_all() -> list[dict]:
        """משיכת הטקסטים מהקטלוג ופירוקם לרמת הפסקה וההלכה הבודדת"""
        # TODO: לולאה על הקטלוג, פנייה ל-Sefaria, ובניית אובייקטי פסקאות עם ref
        pass

    async def run_indexing_pipeline(self):
        """צינור העבודה המלא: שליפה -> המרה לווקטורים -> שמירה ב-Vector DB"""
        # 1. שליפת פסקאות
        # 2. יצירת Embeddings
        # 3. שמירה ב-Vector DB
        pass

if __name__ == "__main__":
    # הרצת הסקריפט מהטרמינל
    pass