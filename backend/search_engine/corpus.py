"""מקור אמת אחד לחלוקת הפסקאות.

גם האינדקס וגם הקורא חייבים לחלק ולמספר פסקאות זהה, אחרת תוצאת חיפוש
תקשר להלכה הלא נכונה. לכן שניהם עוברים דרך unit_paragraphs כאן.
"""
import json
import os

from reader.data.catalog import CATALOG
from utils.hebrew import clean_text_formatting

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw_data")


def iter_sections():
    """חטיבות הקטלוג עם טווח היחידות שכל אחת מכסה.

    max_units הוא מספר היחידה האחרונה ולא כמות, ולכן חטיבות שחולקות base_ref
    (41 חטיבות אורח חיים מצביעות על אותו מערך של 697 סימנים) מחלקות אותו
    לטווחים רצופים. כשה-base_ref מתחלף הספירה מתאפסת.
    """
    prev_ref = None
    prev_end = 0
    for book in CATALOG:
        for category in book.get("categories", []):
            for section in category.get("sections", []):
                base_ref = section["base_ref"]
                if base_ref != prev_ref:
                    prev_ref, prev_end = base_ref, 0
                end = section["max_units"]
                yield {
                    "book_id": book["id"],
                    "book_title": book["title"],
                    "category_name": category.get("name", ""),
                    "section_id": section["id"],
                    "section_name": section["name"],
                    "base_ref": base_ref,
                    "unit_label": section.get("unit_label", "יחידה"),
                    "start_unit": prev_end + 1,
                    "end_unit": end,
                }
                prev_end = end


def find_section(book_id: str | None, section_id: str | None):
    for section in iter_sections():
        if section["section_id"] == section_id and (not book_id or book_id in ("all", section["book_id"])):
            return section
    return None


def _flatten_strings(node):
    if isinstance(node, str):
        yield node
    elif isinstance(node, list):
        for item in node:
            yield from _flatten_strings(item)


def extract_units(node) -> dict[int, list[str]]:
    """{מספר יחידה: [פסקאות גולמיות]} מתוך שדה text של ספריא."""
    if not isinstance(node, list):
        return {}
    if all(isinstance(item, str) for item in node):
        return {i + 1: [item] for i, item in enumerate(node)}
    units = {}
    for i, item in enumerate(node):
        if isinstance(item, str):
            units[i + 1] = [item]
        elif isinstance(item, list):
            units[i + 1] = [p if isinstance(p, str) else " ".join(_flatten_strings(p)) for p in item]
    return units


def load_source(base_ref: str) -> dict[str, dict[int, list[str]]] | None:
    """{sub_ref: {יחידה: [פסקאות]}}.

    ב-dict המפתח הריק הוא גוף החיבור הממוספר, ומפתח בעל שם הוא חטיבת משנה
    (למשל "Seder HaGet") שמקבלת sub_ref משלה.
    """
    path = os.path.join(RAW_DATA_DIR, f"{base_ref}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    text = data.get("text", []) if isinstance(data, dict) else data
    if isinstance(text, dict):
        return {
            (base_ref if key == "" else f"{base_ref}, {key}"): extract_units(value)
            for key, value in text.items()
        }
    return {base_ref: extract_units(text)}


def unit_paragraphs(base_ref: str, unit: int) -> list[str] | None:
    """הפסקאות של יחידה אחת, מנוקות ובלי ריקות.

    זהו המספור הקנוני: המיקום ברשימה המוחזרת (1-based) הוא paragraph_number.
    מחזיר None כשאין קובץ מקומי, כדי שהקורא ידע ליפול חזרה לספריא.
    """
    source = load_source(base_ref)
    if source is None:
        return None
    cleaned = [clean_text_formatting(p) for p in source.get(base_ref, {}).get(unit, [])]
    return [p for p in cleaned if p]
