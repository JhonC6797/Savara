import re
from utils.hebrew import int_to_hebrew
from search_engine.bm25_service import ACRONYMS

MAX_QUERY_CHARS = 300

SUB_BOOK_HEBREW_MAP = {
    "Foundations of the Torah": "הלכות יסודי התורה",
    "Human Dispositions": "הלכות דעות",
    "Torah Study": "הלכות תלמוד תורה",
    "Foreign Worship and Customs of the Nations": "הלכות עבודה זרה",
    "Repentance": "הלכות תשובה",
    "Reading the Shema": "הלכות קריאת שמע",
    "Prayer and the Priestly Blessing": "הלכות תפילה",
    "Sabbath": "הלכות שבת",
    "Orach Chayim": "אורח חיים",
    "Yoreh De'ah": "יורה דעה",
    "Even HaEzer": "אבן העזר",
    "Choshen Mishpat": "חושן משפט",
    "Part 1": "חלק ראשון",
    "Part 2": "חלק שני",
    "Part 3": "חלק שלישי",
}

def clean_query_text(text: str) -> str:
    if len(text) > MAX_QUERY_CHARS:
        text = text[:MAX_QUERY_CHARS]
    return re.sub(r'[\u0591-\u05C7]', '', text).strip()

def expand_acronyms(text: str) -> str:
    words = text.split()
    res = []
    for w in words:
        clean_w = w.replace('"', '').replace('״', '')
        if clean_w in ACRONYMS:
            res.append(ACRONYMS[clean_w])
        elif w in ACRONYMS:
            res.append(ACRONYMS[w])
        else:
            res.append(w)
    return " ".join(res)

def format_search_title_and_nav(payload: dict) -> tuple[str, dict]:
    raw_book_id = payload.get("book_id", "")
    sub_title = payload.get("sub_book_title") or payload.get("book_title") or ""
    sec_name = payload.get("section_name", "")
    para_idx = payload.get("paragraph_idx", 0) + 1

    match_num = re.search(r'\d+', sec_name)
    unit_num = int(match_num.group()) if match_num else 1
    unit_hebrew = int_to_hebrew(unit_num)
    para_hebrew = int_to_hebrew(para_idx)

    clean_sub = sub_title
    for eng, heb in SUB_BOOK_HEBREW_MAP.items():
        if eng.lower() in sub_title.lower():
            clean_sub = heb
            break

    if "mishneh" in raw_book_id or "rambam" in raw_book_id:
        title = f"משנה תורה, {clean_sub} - פרק {unit_hebrew} הלכה {para_hebrew}"
        book_id = "mishneh_torah"
    elif "shulchan" in raw_book_id or "arukh" in raw_book_id:
        title = f"שולחן ערוך, {clean_sub} - סימן {unit_hebrew} סעיף {para_hebrew}"
        book_id = "shulchan_arukh"
    elif "mesillat" in raw_book_id:
        title = f"מסילת ישרים - {clean_sub} (פרק {unit_hebrew})"
        book_id = "mesillat_yesharim"
    elif "guide" in raw_book_id or "moreh" in raw_book_id:
        title = f"מורה נבוכים, {clean_sub} - פרק {unit_hebrew}"
        book_id = "guide_for_the_perplexed"
    else:
        title = f"{clean_sub} - פרק {unit_hebrew} אות {para_hebrew}"
        book_id = raw_book_id

    nav_params = {
        "book_id": book_id,
        "sub_book": clean_sub,
        "section": sec_name,
        "unit": unit_num,
        "paragraph": para_idx
    }

    return title, nav_params

def combine_results_rrf(vector_results: list, bm25_results: list, k: int = 60, limit: int = 10) -> list:
    scores = {}
    payload_map = {}

    def process_list(results):
        for rank, item in enumerate(results):
            payload = item["payload"]
            doc_id = f"{payload.get('book_id')}_{payload.get('section_name')}_{payload.get('paragraph_idx')}"
            scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            payload_map[doc_id] = payload

    process_list(vector_results)
    process_list(bm25_results)

    if not scores:
        return []

    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
    max_score = sorted_docs[0][1] if sorted_docs else 1.0

    output = []
    for doc_id, score in sorted_docs:
        payload = payload_map[doc_id]
        display_title, nav_data = format_search_title_and_nav(payload)

        output.append({
            "score": round((score / max_score) * 98.5, 1),
            "display_title": display_title,
            "nav": nav_data,
            "payload": payload
        })

    return output