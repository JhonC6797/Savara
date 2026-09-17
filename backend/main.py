import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from reader.routers.catalog_router import router as catalog_router
from reader.routers.text_router import router as text_router
from search_engine.router import router as search_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # האינדקס לא מקומיט ב-git, ולכן בפריסה נקייה הוא חסר. בנייה כאן היא רשת
    # ביטחון שעולה ~10 שניות פעם אחת; עדיף להריץ build_index בפקודת ה-build.
    from search_engine.build_index import INDEX_PATH, main as build_index

    if not os.path.exists(INDEX_PATH):
        print("אינדקס החיפוש חסר — בונה כעת...")
        build_index()
    yield


app = FastAPI(title="Svara API", lifespan=lifespan)


@app.get("/api/health")
def health():
    from search_engine.build_index import INDEX_PATH

    return {
        "status": "ok",
        "index_exists": os.path.exists(INDEX_PATH),
        "index_mb": round(os.path.getsize(INDEX_PATH) / 1e6, 1) if os.path.exists(INDEX_PATH) else 0,
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# חיבור ה-Routers הייעודיים
app.include_router(catalog_router)
app.include_router(text_router)
app.include_router(search_router)