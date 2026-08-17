from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.catalog_router import router as catalog_router
from routers.text_router import router as text_router

app = FastAPI(title="Svara Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# רישום הרוטרים
app.include_router(catalog_router)
app.include_router(text_router)