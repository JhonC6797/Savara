from fastapi import APIRouter
from data.catalog import CATALOG

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])

@router.get("")
def get_catalog():
    return CATALOG