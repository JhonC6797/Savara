import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from reader.routers.catalog_router import router as catalog_router
from reader.routers.text_router import router as text_router
from search_engine.router import router as search_router

app = FastAPI(title="Svara API")

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