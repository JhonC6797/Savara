import os
import re
import pickle
from rank_bm25 import BM25Okapi

HEBREW_STOPWORDS = {
    "מי", "מה", "איפה", "מתי", "למה", "איך", "הוא", "היא", "הם", "הן", "של", "על",
    "בתוך", "את", "עם", "זה", "זו", "אלה", "אלו", "כי", "אם", "אל", "כל", "כמו",
    "פי", "כפי", "לפי", "גבי", "אשר", "היה", "היתה", "היו", "שלה", "שלו"
}

# מילון ראשי תיבות תורניים (עטוף במרכאות בודדות למניעת שגיאות Syntax)
ACRONYMS = {
    'רמבמ': 'משנה תורה משה בן מימון',
    'רמב״ם': 'משנה תורה משה בן מימון',
    'רמב"ם': 'משנה תורה משה בן מימון',
    'שוע': 'שולחן ערוך',
    'שו״ע': 'שולחן ערוך',
    'שו"ע': 'שולחן ערוך',
    'קבה': 'אלוהים הקדוש ברוך הוא',
    'קב״ה': 'אלוהים הקדוש ברוך הוא',
    'קב"ה': 'אלוהים הקדוש ברוך הוא',
    'חזל': 'חכמים חכמינו זכרונם לברכה',
    'חז״ל': 'חכמים חכמינו זכרונם לברכה',
    'חז"ל': 'חכמים חכמינו זכרונם לברכה',
}

class BM25Service:
    def __init__(self, index_path=None):
        if index_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            index_path = os.path.join(base_dir, "bm25_index.pkl")

        self.index_path = index_path
        self.bm25 = None
        self.payloads = []
        self.load_index()

    def remove_nikud(self, text: str) -> str:
        return re.sub(r'[\u0591-\u05C7]', '', text)

    def strip_hebrew_prefixes(self, word: str) -> str:
        """הסרת אותיות שימוש נפוצות בעברית (ו, ש, מ, ל, כ, ב, ה)"""
        while len(word) > 3 and word.startswith(('וה', 'וש', 'ומ', 'ול', 'וכ', 'וב', 'שה', 'שב', 'של', 'שמ', 'מה', 'מב')):
            word = word[2:]
        if len(word) > 3 and word.startswith(('ו', 'ש', 'מ', 'ל', 'כ', 'ב', 'ה')):
            word = word[1:]
        return word

    def tokenize(self, text: str) -> list[str]:
        text = self.remove_nikud(text)
        
        words_raw = text.split()
        expanded_words = []
        for w in words_raw:
            clean_w = w.replace('"', '').replace('״', '')
            if clean_w in ACRONYMS:
                expanded_words.append(ACRONYMS[clean_w])
            elif w in ACRONYMS:
                expanded_words.append(ACRONYMS[w])
            else:
                expanded_words.append(w)
        
        text = " ".join(expanded_words)
        cleaned = re.sub(r'[^\w\s-]', ' ', text)
        
        tokens = []
        for w in cleaned.split():
            if len(w) <= 1 or w.lower() in HEBREW_STOPWORDS:
                continue
            stemmed_w = self.strip_hebrew_prefixes(w)
            tokens.append(stemmed_w)
            
        return tokens

    def build_index(self, documents: list[dict]):
        tokenized_corpus = [self.tokenize(doc["text"]) for doc in documents]
        self.bm25 = BM25Okapi(tokenized_corpus)
        self.payloads = [doc["payload"] for doc in documents]

        with open(self.index_path, "wb") as f:
            pickle.dump((self.bm25, self.payloads), f)

    def load_index(self):
        if os.path.exists(self.index_path):
            with open(self.index_path, "rb") as f:
                self.bm25, self.payloads = pickle.load(f)

    def search(self, query: str, limit: int = 30, book_id: str = None) -> list[dict]:
        if not self.bm25:
            return []

        tokenized_query = self.tokenize(query)
        if not tokenized_query:
            return []

        scores = self.bm25.get_scores(tokenized_query)
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)

        results = []
        for idx in top_indices:
            if scores[idx] <= 0:
                break
            payload = self.payloads[idx]
            if book_id and book_id != "all" and payload.get("book_id") != book_id:
                continue
            results.append({
                "score": float(scores[idx]),
                "payload": payload
            })
            if len(results) >= limit:
                break
        return results