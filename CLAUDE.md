# CLAUDE.md

מסמך הקשר לסוכני Claude Code העובדים על פרויקט **סברא (Svara)**.

## מהו הפרויקט

אפליקציית web (PWA) בעברית לקריאה, ניווט וחיפוש בספרי יסוד תורניים.
ממשק RTL מלא. הטקסטים מקורם ב-Sefaria ונשמרים מקומית לעבודה offline-first.

**המאגר:** 4 ספרים, 181 חטיבות, 22,975 פסקאות מאונדקסות — משנה תורה, שולחן ערוך, מסילת ישרים, מורה נבוכים.

**אילוץ מחייב:** כל התשתית חייבת להיות חינמית ולהיכנס ב-Render free tier (512MB). אין שירותים בתשלום.

## מבנה

```
backend/                      FastAPI
  main.py                     מרכיב 3 ראוטרים; מוסיף BASE_DIR ל-sys.path
  reader/
    data/catalog.json         מקור האמת להיררכיית הספרים
    routers/catalog_router.py /api/catalog
    routers/text_router.py    /api/text — offline-first, fallback לספריא
  search_engine/
    corpus.py                 מקור אמת יחיד לחלוקת פסקאות (ראה למטה)
    build_index.py            בונה את אינדקס FTS5
    router.py                 /api/search
    data_fetcher.py           הורדת טקסטים מ-Sefaria-Export
    raw_data/*.json           65 קבצי טקסט מלאים (~34MB)
  utils/hebrew.py             גימטריה דו-כיוונית, ניקוי, נרמול עברי
  search_index.db             אינדקס FTS5 — נבנה, לא מקומיט (ב-gitignore)

frontend/                     React 19 + Vite 8
  src/App.jsx                 state ראשי; מסכים: catalog / reader / settings
  src/components/             BookCatalog, ReaderView, SearchBar, SettingsPage
  src/services/api.js         קריאות HTTP; VITE_API_URL או localhost:8000
```

## מודל הנתונים

היררכיה: **ספר ← קטגוריה ← חטיבה ← יחידה (פרק/סימן) ← פסקה (הלכה/סעיף)**

```json
{
  "id": "oc_tefillin",
  "name": "הלכות תפילין (כה-מה)",
  "base_ref": "Shulchan Arukh, Orach Chayim",
  "max_units": 45,
  "unit_label": "סימן"
}
```

`base_ref` הוא הגשר לשני העולמות: גם שם הקובץ ב-`raw_data/{base_ref}.json` וגם ה-ref של Sefaria API.

## החלטות ארכיטקטוניות

**`max_units` הוא מספר היחידה האחרונה, לא כמות.** זו הנקודה הכי לא אינטואיטיבית בפרויקט. 41 חטיבות אורח חיים חולקות `base_ref` אחד ומצביעות על אותו מערך של 697 סימנים; כל חטיבה היא **טווח**. `corpus.iter_sections()` מחשב `start_unit = prev.max_units + 1` ומאפס כשה-`base_ref` מתחלף. הכלל אחיד לכל הספרים — לחטיבה עם `base_ref` ייחודי הוא מתנוון ל-`[1..max_units]`.

**אל תנתח את הסוגריים העבריים בשם החטיבה.** נמצאו 10 סתירות בין השם לטווח המחושב. הטווח המחושב הוא הנכון.

**`corpus.py` הוא מקור אמת יחיד לחלוקת פסקאות.** גם האינדקס וגם הקורא חייבים לחלק ולמספר פסקאות זהה — אחרת תוצאת חיפוש תקשר להלכה הלא נכונה. שניהם עוברים דרך `unit_paragraphs()`. **אל תשכפל את הלוגיקה הזו.**

**Offline-first.** הקורא קורא מ-`raw_data/` ונופל ל-Sefaria API v3 רק כשאין קובץ. השדה `source` בתשובה (`local`/`network`) מציין מאיפה.

**מבנה ה-JSON לא אחיד.** במשנה תורה ובשלושה כרכי שו"ע `text` הוא `list`. במסילת ישרים, מורה נבוכים **ובאבן העזר** הוא `dict` — כולל מפתח בשם `""` (גוף החיבור הממוספר) ועומק מעורב. `corpus.extract_units()` מטפל בכל המקרים.

**עברית דורשת שתי צורות טקסט.** `body` הוא הטקסט כפי שהוא (לציטוט מדויק), `body_loose` עובר `loose_form()` שמפשיט אותיות שימוש (ו/ש/מ/ל/כ/ב/ה) ומרחיב ראשי תיבות. בלי זה "התפילין" ו"תפילין" הם טוקנים נפרדים — הראשון מופיע ב-15 פסקאות, השני ב-92. **כל שינוי ב-`loose_form` מחייב בנייה מחדש של האינדקס**, כי השאילתה והאינדקס חייבים לעבור נרמול זהה.

## החיפוש

SQLite FTS5 — ללא תלויות חיצוניות, ללא מודל, ~20MB RAM. שאילתה 2-4ms.

**סולם הסלמה** ב-`router.build_ladder()`, נעצר בשלב הראשון שמחזיר תוצאות:

| שלב | עמודה | תוצאה |
|---|---|---|
| `exact` | `body` | ביטוי רצוף — ציטוט מדויק |
| `all_words` | `body` | כל המילים כלשונן |
| `all_words_loose` | `body_loose` | כל המילים בהטיות |
| `partial` | `body_loose` | חלק מהמילים, מדורג ב-`bm25()` |

השאילתה מפורקת לטוקנים שמסירים כל תו שאינו אות/ספרה, ולכן תחביר FTS5 מנוטרל ואי אפשר להזריק שאילתה.

## פקודות

```bash
# backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python -m search_engine.build_index     # חובה לפני הרצה ראשונה (~10 שניות)
uvicorn main:app --reload               # http://127.0.0.1:8000, docs ב-/docs

# frontend
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

> ב-Windows, `localhost` מתעכב ~2 שניות בגלל ניסיון IPv6 שנכשל. השתמש ב-**`127.0.0.1`** בבדיקות.

**Render build command** חייב לכלול את בניית האינדקס:
`pip install -r requirements.txt && python -m search_engine.build_index`

## מצב ידוע

**פערי נתונים** (החיפוש עובד, פשוט לא מכסה אותם):
- **מורה נבוכים ריק.** כל 7 הקבצים זהים (8,972B), 2 מחרוזות לא ריקות בסך הכל. `data_fetcher.py` התאים על `base_ref.split(".")[0]` ומשך את אותו stub לשלושת החלקים, בגרסה בשם `"Guide for the Perplexed temp"`. דורש משיכה מחדש עם בחירת הגרסה העברית המלאה.
- **7 חטיבות משנה תורה בלי קובץ** — מגילה וחנוכה, נזירות, תרומות, בית הבחירה, רוצח, נחלות, סנהדרין.
- 12 קבצים עם קו תחתון הם כפילויות מדויקות. `build_index` מונחה־קטלוג ולכן מתעלם מהם, אבל הם עדיין תופסים מקום בריפו.

**Frontend:** `tailwindcss` חסר מ-`package.json` למרות ש-`index.css` פותח ב-`@tailwind` ו-`App.jsx` משתמש ב-utility classes. הבנייה עוברת עם אזהרה, אבל ה-classes לא חלים (כולל dark mode).

**Deploy:** push ל-`main` מפעיל GitHub Actions שקורא ל-Render deploy hook (backend בלבד). ה-frontend אינו נפרס אוטומטית.

**CORS:** `allow_origins=["*"]` ב-`main.py`. לצמצם לדומיינים של Vercel לפני production.

## מוסכמות

- הערות קוד ומחרוזות למשתמש — בעברית. מזהים באנגלית.
- אין כרגע tests אוטומטיים.
- `raw_data/` גדול; אל תקרא קבצים משם במלואם לתוך ההקשר.
- חיפוש סמנטי מתוכנן כשלב הבא. המזהה `ref = "{base_ref}.{unit}.{paragraph}"` הוא הגשר — הוא יהיה ה-ID של הנקודה ב-vector DB, והמיזוג יצרף את שתי הרשימות לפיו.
