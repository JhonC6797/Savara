import json
import os

CATALOG_PATH = os.path.join(os.path.dirname(__file__), "catalog.json")

def load_catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

CATALOG = load_catalog()