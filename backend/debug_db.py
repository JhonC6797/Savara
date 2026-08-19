from search_engine.vector_db import VectorDBService

def check_db():
    db = VectorDBService()
    # ננסה לשלוף נתונים כלשהם מהקולקציה
    try:
        # בדיקה אם יש נתונים
        count = db.client.count(collection_name="torah_texts")
        print(f"--- בדיקת תקינות מסד נתונים ---")
        print(f"מספר פסקאות ב-DB: {count.count}")
        
        if count.count > 0:
            print("הצלחה! הנתונים קיימים במסד הנתונים.")
        else:
            print("אזהרה: מסד הנתונים ריק.")
    except Exception as e:
        print(f"שגיאה בגישה ל-DB: {e}")

if __name__ == "__main__":
    check_db()