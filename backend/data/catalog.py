# backend/data/catalog.py

CATALOG = [
    {
        "id": "mishneh_torah",
        "title": "משנה תורה (הרמב''ם)",
        "author": "רבנו משה בן מיימון",
        "category": "הלכה ופילוסופיה",
        "description": "היד החזקה - 14 ספרים המקיפים את כל עולמה של ההלכה.",
        "sections": [
            {
                "id": "foundations",
                "name": "הלכות יסודי התורה",
                "base_ref": "Mishneh_Torah,_Foundations_of_the_Torah",
                "unit_name": "פרק",
                "max_units": 10
            },
            {
                "id": "deot",
                "name": "הלכות דעות",
                "base_ref": "Mishneh_Torah,_Human_Dispositions",
                "unit_name": "פרק",
                "max_units": 7
            },
            {
                "id": "talmud_torah",
                "name": "הלכות תלמוד תורה",
                "base_ref": "Mishneh_Torah,_Torah_Study",
                "unit_name": "פרק",
                "max_units": 7
            },
            {
                "id": "teshuva",
                "name": "הלכות תשובה",
                "base_ref": "Mishneh_Torah,_Repentance",
                "unit_name": "פרק",
                "max_units": 10
            }
        ]
    },
    {
        "id": "shulchan_arukh",
        "title": "שולחן ערוך",
        "author": "רבי יוסף קארו (המר''ן)",
        "category": "הלכה",
        "description": "ארבעת חלקי השולחן ערוך המהווים בסיס לפסיקת ההלכה.",
        "sections": [
            {
                "id": "orach_chayim",
                "name": "אורח חיים (דיני יום-יום ושבת)",
                "base_ref": "Shulchan_Arukh,_Orach_Chayim",
                "unit_name": "סימן",
                "max_units": 697
            },
            {
                "id": "yoreh_deah",
                "name": "יורה דעה (איסור והיתר)",
                "base_ref": "Shulchan_Arukh,_Yoreh_De'ah",
                "unit_name": "סימן",
                "max_units": 403
            }
        ]
    },
    {
        "id": "guide_for_perplexed",
        "title": "מורה נבוכים",
        "author": "רבנו משה בן מיימון (הרמב''ם)",
        "category": "פילוסופיה תורנית",
        "description": "חיבור פילוסופי מעמיק לביאור סודות התורה וייחוד האל.",
        "sections": [
            {
                "id": "intro",
                "name": "הקדמת הרמב''ם",
                "base_ref": "Guide_for_the_Perplexed,_Part_1.Introduction",
                "unit_name": "הקדמה",
                "is_single": True
            },
            {
                "id": "part1",
                "name": "חלק א' (שלילת הגשמיות וביאור מילים)",
                "base_ref": "Guide_for_the_Perplexed,_Part_1",
                "unit_name": "פרק",
                "max_units": 76
            },
            {
                "id": "part2",
                "name": "חלק ב' (בריאת העולם והנבואה)",
                "base_ref": "Guide_for_the_Perplexed,_Part_2",
                "unit_name": "פרק",
                "max_units": 48
            },
            {
                "id": "part3",
                "name": "חלק ג' (מעשה מרכבה וטעמי המצוות)",
                "base_ref": "Guide_for_the_Perplexed,_Part_3",
                "unit_name": "פרק",
                "max_units": 54
            }
        ]
    },
    {
        "id": "mesillat_yesharim",
        "title": "מסילת ישרים",
        "author": "רבי משה חיים לוצאטו (הרמח''ל)",
        "category": "מוסר ומחשבה",
        "description": "סולם התעלות רוחני בן 26 שלבים מזהירות ועד קדושה.",
        "sections": [
            {
                "id": "intro",
                "name": "הקדמת המחבר",
                "base_ref": "Mesillat_Yesharim.Introduction",
                "unit_name": "הקדמה",
                "is_single": True
            },
            {
                "id": "main",
                "name": "גוף הספר (פרקים א'–כו')",
                "base_ref": "Mesillat_Yesharim",
                "unit_name": "פרק",
                "max_units": 26
            }
        ]
    }
]