import re

HEBREW_GEMATRIA = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
}

def hebrew_to_int(hebrew_str: str) -> int:
    """המרה מאותיות עבריות/גימטריה למספר שלם"""
    clean = re.sub(r"[^\u05D0-\u05EA]", "", hebrew_str)
    if not clean:
        return 0
    return sum(HEBREW_GEMATRIA.get(char, 0) for char in clean)

def int_to_hebrew(num: int) -> str:
    """המרה ממספר שלם לאותיות עבריות עם מרכאות/גרשיים"""
    if not isinstance(num, int) or num <= 0:
        return str(num)

    units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
    tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"]
    hundreds = ["", "ק", "ר", "ש", "ת"]

    if num % 100 == 15:
        prefix = int_to_hebrew(num - 15).replace("'", "").replace('"', '')
        return (prefix + "ט\"ו") if num > 100 else "ט\"ו"
    if num % 100 == 16:
        prefix = int_to_hebrew(num - 16).replace("'", "").replace('"', '')
        return (prefix + "ט\"ז") if num > 100 else "ט\"ז"

    res = ""
    h = num // 100
    while h > 4:
        res += "ת"
        h -= 4
    if h > 0:
        res += hundreds[h]

    t = (num % 100) // 10
    res += tens[t]

    u = num % 10
    res += units[u]

    if len(res) == 1:
        return res + "'"
    elif len(res) > 1:
        return res[:-1] + '"' + res[-1]
    return str(num)

def clean_text_formatting(text: str) -> str:
    """הסרת תגיות HTML, ניקוד ורווחים כפולים"""
    if not text:
        return ""
    cleaned = re.sub(r'<[^>]+>', '', text)
    cleaned = re.sub(r'[\u0591-\u05C7]', '', cleaned)
    return ' '.join(cleaned.split())