# נקודת הכניסה הראשית - מחברת בין ה-Reader ל-Search Engine

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ייבוא ה-Routers מהמודולים המופרדים
from reader.routers.catalog_router import router as catalog_router
from reader.routers.text_router import router as text_router
from search_engine.router import router as search_router

app = FastAPI(title="Svara Engine Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# רישום נתיבי ה-Core Reader
app.include_router(catalog_router)
app.include_router(text_router)

# רישום נתיב ה-Semantic Search Engine
app.include_router(search_router)