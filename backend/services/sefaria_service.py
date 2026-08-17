# backend/services/sefaria_service.py
import httpx
from bs4 import BeautifulSoup

def clean_html(raw_html: str) -> str:
    """ניקוי תגיות HTML והחלפתן ברווח למניעת הדבקת מילים"""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    text = soup.get_text(separator=" ")
    return " ".join(text.split())

async def fetch_text_from_sefaria(ref: str):
    """שליפת המקור מ-Sefaria API, ניקוי ועיבוד"""
    url = f"https://www.sefaria.org/api/texts/{ref}?context=0"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            return None
        
        data = response.json()
        raw_hebrew = data.get("he", [])
        if isinstance(raw_hebrew, str):
            raw_hebrew = [raw_hebrew]

        cleaned_sections = [clean_html(sec) for sec in raw_hebrew if sec]

        return {
            "title": data.get("heTitle", data.get("book", "")),
            "ref": data.get("ref", ""),
            "next_ref": data.get("next"),
            "prev_ref": data.get("prev"),
            "sections": cleaned_sections
        }