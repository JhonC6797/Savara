# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from reader.routers.catalog_router import router as catalog_router
from reader.routers.text_router import router as text_router
from search_engine.router import router as search_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# חיבור כל הנתיבים בשרת
app.include_router(catalog_router)
app.include_router(text_router)
app.include_router(search_router)