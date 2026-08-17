# backend/reader/data/catalog.py

CATALOG = [
    {
        "id": "mishneh_torah",
        "title": "משנה תורה (הרמב''ם)",
        "description": "קודקס הלכתי מקיף המחולק ל-14 ספרים",
        "categories": [
            {
                "name": "ספר המדע",
                "sections": [
                    {"id": "yesodei_hatorah", "name": "הלכות יסודי התורה", "base_ref": "Mishneh Torah, Foundations of the Torah", "max_units": 10, "unit_label": "פרק"},
                    {"id": "deot", "name": "הלכות דעות", "base_ref": "Mishneh Torah, Human Dispositions", "max_units": 7, "unit_label": "פרק"},
                    {"id": "talmud_torah", "name": "הלכות תלמוד תורה", "base_ref": "Mishneh Torah, Torah Study", "max_units": 7, "unit_label": "פרק"},
                    {"id": "avodat_kochavim", "name": "הלכות עבודה זרה וחוקות הגויים", "base_ref": "Mishneh Torah, Foreign Worship and Customs of the Nations", "max_units": 12, "unit_label": "פרק"},
                    {"id": "teshuva", "name": "הלכות תשובה", "base_ref": "Mishneh Torah, Repentance", "max_units": 10, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר אהבה",
                "sections": [
                    {"id": "kriat_shema", "name": "הלכות קריאת שמע", "base_ref": "Mishneh Torah, Reading the Shema", "max_units": 4, "unit_label": "פרק"},
                    {"id": "tefillah", "name": "הלכות תפילה וברכת כהנים", "base_ref": "Mishneh Torah, Prayer and the Priestly Blessing", "max_units": 15, "unit_label": "פרק"},
                    {"id": "tefillin", "name": "הלכות תפילין ומזוזה וספר תורה", "base_ref": "Mishneh Torah, Tefillin, Mezuzah and the Torah Scroll", "max_units": 10, "unit_label": "פרק"},
                    {"id": "tzitzit", "name": "הלכות ציצית", "base_ref": "Mishneh Torah, Fringes", "max_units": 3, "unit_label": "פרק"},
                    {"id": "berachot", "name": "הלכות ברכות", "base_ref": "Mishneh Torah, Blessings", "max_units": 11, "unit_label": "פרק"},
                    {"id": "milah", "name": "הלכות מילה", "base_ref": "Mishneh Torah, Circumcision", "max_units": 3, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר זמנים",
                "sections": [
                    {"id": "shabbat", "name": "הלכות שבת", "base_ref": "Mishneh Torah, Sabbath", "max_units": 30, "unit_label": "פרק"},
                    {"id": "eiruvin", "name": "הלכות עירובין", "base_ref": "Mishneh Torah, Eruvin", "max_units": 8, "unit_label": "פרק"},
                    {"id": "yom_tov", "name": "הלכות שביתת יום טוב", "base_ref": "Mishneh Torah, Rest on a Holiday", "max_units": 8, "unit_label": "פרק"},
                    {"id": "chametz_umatzah", "name": "הלכות חמץ ומצה", "base_ref": "Mishneh Torah, Leavened and Unleavened Bread", "max_units": 8, "unit_label": "פרק"},
                    {"id": "shofar_sukkah", "name": "הלכות שופר וסוכה ולולב", "base_ref": "Mishneh Torah, Shofar, Sukkah and Lulav", "max_units": 8, "unit_label": "פרק"},
                    {"id": "taaniyot", "name": "הלכות תעניות", "base_ref": "Mishneh Torah, Fasts", "max_units": 5, "unit_label": "פרק"},
                    {"id": "megillah_chanukah", "name": "הלכות מגילה וחנוכה", "base_ref": "Mishneh Torah, Megillah and Chanukah", "max_units": 4, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר נשים",
                "sections": [
                    {"id": "ishut", "name": "הלכות אישות", "base_ref": "Mishneh Torah, Marriage", "max_units": 25, "unit_label": "פרק"},
                    {"id": "gittin", "name": "הלכות גיטין", "base_ref": "Mishneh Torah, Divorce", "max_units": 13, "unit_label": "פרק"},
                    {"id": "yibbum", "name": "הלכות יבום וחליצה", "base_ref": "Mishneh Torah, Levirate Marriage and Release", "max_units": 8, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר קדושה",
                "sections": [
                    {"id": "issurei_biah", "name": "הלכות איסורי ביאה", "base_ref": "Mishneh Torah, Forbidden Intercourse", "max_units": 22, "unit_label": "פרק"},
                    {"id": "maachalot_assurot", "name": "הלכות מאכלות אסורות", "base_ref": "Mishneh Torah, Forbidden Foods", "max_units": 17, "unit_label": "פרק"},
                    {"id": "shechitah", "name": "הלכות שחיטה", "base_ref": "Mishneh Torah, Ritual Slaughter", "max_units": 14, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר הפלאה",
                "sections": [
                    {"id": "nedarim", "name": "הלכות נדרים", "base_ref": "Mishneh Torah, Vows", "max_units": 13, "unit_label": "פרק"},
                    {"id": "nezirut", "name": "הלכות נזירות", "base_ref": "Mishneh Torah, Naziriteship", "max_units": 10, "unit_label": "פרק"},
                    {"id": "shevuot", "name": "הלכות שבועות", "base_ref": "Mishneh Torah, Oaths", "max_units": 12, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר זרעים",
                "sections": [
                    {"id": "kilayim", "name": "הלכות כלאים", "base_ref": "Mishneh Torah, Diverse Species", "max_units": 10, "unit_label": "פרק"},
                    {"id": "matnot_aniyim", "name": "הלכות מתנות עניים", "base_ref": "Mishneh Torah, Gifts to the Poor", "max_units": 10, "unit_label": "פרק"},
                    {"id": "terumot", "name": "הלכות תרומות", "base_ref": "Mishneh Torah, Great Heave Offering", "max_units": 15, "unit_label": "פרק"},
                    {"id": "shemittah", "name": "הלכות שמיטה ויובל", "base_ref": "Mishneh Torah, Sabbatical Year and the Jubilee", "max_units": 13, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר עבודה",
                "sections": [
                    {"id": "beit_habechirah", "name": "הלכות בית הבחירה", "base_ref": "Mishneh Torah, The Chosen House", "max_units": 8, "unit_label": "פרק"},
                    {"id": "klei_hamikdash", "name": "הלכות כלי המקדש והעובדים בו", "base_ref": "Mishneh Torah, Vessels of the Sanctuary and Those Who Serve Therein", "max_units": 10, "unit_label": "פרק"},
                    {"id": "maaseh_hakorbanot", "name": "הלכות מעשה הקורבנות", "base_ref": "Mishneh Torah, Sacrificial Procedure", "max_units": 19, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר קרבנות",
                "sections": [
                    {"id": "korban_pesach", "name": "הלכות קרבן פסח", "base_ref": "Mishneh Torah, Paschal Offering", "max_units": 10, "unit_label": "פרק"},
                    {"id": "chagigah", "name": "הלכות חגיגה", "base_ref": "Mishneh Torah, Festival Offering", "max_units": 3, "unit_label": "פרק"},
                    {"id": "bechorot", "name": "הלכות בכורות", "base_ref": "Mishneh Torah, Firstlings", "max_units": 8, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר טהרה",
                "sections": [
                    {"id": "tumat_met", "name": "הלכות טומאת מת", "base_ref": "Mishneh Torah, Defilement by a Corpse", "max_units": 25, "unit_label": "פרק"},
                    {"id": "mikvaot", "name": "הלכות מקוואות", "base_ref": "Mishneh Torah, Immersion Pools", "max_units": 11, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר נזיקין",
                "sections": [
                    {"id": "nizkei_mamon", "name": "הלכות נזקי ממון", "base_ref": "Mishneh Torah, Damages to Property", "max_units": 14, "unit_label": "פרק"},
                    {"id": "genevah", "name": "הלכות גנבה", "base_ref": "Mishneh Torah, Theft", "max_units": 9, "unit_label": "פרק"},
                    {"id": "gezelah", "name": "הלכות גזלה ואבדה", "base_ref": "Mishneh Torah, Robbery and Lost Property", "max_units": 18, "unit_label": "פרק"},
                    {"id": "roatzeach", "name": "הלכות רוצח ושמירת נפש", "base_ref": "Mishneh Torah, Murder and Preservation of Life", "max_units": 13, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר קנין",
                "sections": [
                    {"id": "mechirah", "name": "הלכות מכירה", "base_ref": "Mishneh Torah, Sales", "max_units": 30, "unit_label": "פרק"},
                    {"id": "zchiyah", "name": "הלכות זכייה ומתנה", "base_ref": "Mishneh Torah, Ownerless Property and Gifts", "max_units": 12, "unit_label": "פרק"},
                    {"id": "shcheirut", "name": "הלכות שכירות", "base_ref": "Mishneh Torah, Hiring", "max_units": 13, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר משפטים",
                "sections": [
                    {"id": "toen_nitan", "name": "הלכות טוען ונטען", "base_ref": "Mishneh Torah, Plaintiff and Defendant", "max_units": 16, "unit_label": "פרק"},
                    {"id": "nachalot", "name": "הלכות נחלות", "base_ref": "Mishneh Torah, Inheritance", "max_units": 11, "unit_label": "פרק"}
                ]
            },
            {
                "name": "ספר שופטים",
                "sections": [
                    {"id": "sanhedrin", "name": "הלכות סנהדרין והעונשין המסורין להם", "base_ref": "Mishneh Torah, The Sanhedrin and the Penalties within their Jurisdiction", "max_units": 26, "unit_label": "פרק"},
                    {"id": "edut", "name": "הלכות עדות", "base_ref": "Mishneh Torah, Testimony", "max_units": 22, "unit_label": "פרק"},
                    {"id": "mamrim", "name": "הלכות ממרים", "base_ref": "Mishneh Torah, Rebels", "max_units": 7, "unit_label": "פרק"},
                    {"id": "melachim", "name": "הלכות מלכים ומלחמותיהם", "base_ref": "Mishneh Torah, Kings and Wars", "max_units": 12, "unit_label": "פרק"}
                ]
            }
        ]
    },
    {
        "id": "shulchan_arukh",
        "title": "שולחן ערוך",
        "description": "ארבעת הטורים המהווים את היסוד לפסיקת ההלכה",
        "categories": [
            {
                "name": "חלקים ראשיים",
                "sections": [
                    {"id": "orach_chayim", "name": "אורח חיים (תפילה, שבת ומועדים)", "base_ref": "Shulchan Arukh, Orach Chayim", "max_units": 697, "unit_label": "סימן"},
                    {"id": "yoreh_deah", "name": "יורה דעה (איסור והיתר, כשרות וטהרה)", "base_ref": "Shulchan Arukh, Yoreh De'ah", "max_units": 403, "unit_label": "סימן"},
                    {"id": "even_haezer", "name": "אבן העזר (אישות, קידושין וגירושין)", "base_ref": "Shulchan Arukh, Even HaEzer", "max_units": 178, "unit_label": "סימן"},
                    {"id": "choshen_mishpat", "name": "חושן משפט (דיני ממונות, נזיקין ודיינים)", "base_ref": "Shulchan Arukh, Choshen Mishpat", "max_units": 425, "unit_label": "סימן"}
                ]
            }
        ]
    },
    {
        "id": "mesillat_yesharim",
        "title": "מסילת ישרים",
        "description": "סולם העלייה הרוחנית מאת הרמח''ל",
        "categories": [
            {
                "name": "סולם המידות",
                "sections": [
                    {"id": "main", "name": "מסילת ישרים (הקדמה ופרקים א'-כו')", "base_ref": "Mesillat Yesharim", "max_units": 26, "unit_label": "פרק"}
                ]
            }
        ]
    },
    {
        "id": "guide_for_the_perplexed",
        "title": "מורה נבוכים",
        "description": "החיבור הפילוסופי המרכזי של הרמב''ם",
        "categories": [
            {
                "name": "חלקי החיבור",
                "sections": [
                    {"id": "part_1", "name": "חלק ראשון (מונחים וביטויים הומורפיים)", "base_ref": "Guide for the Perplexed, Part 1", "max_units": 76, "unit_label": "פרק"},
                    {"id": "part_2", "name": "חלק שני (מציאות ה', בריאה ונבואה)", "base_ref": "Guide for the Perplexed, Part 2", "max_units": 48, "unit_label": "פרק"},
                    {"id": "part_3", "name": "חלק שלישי (מעשה מרכבה, השגחה וטעמי המצוות)", "base_ref": "Guide for the Perplexed, Part 3", "max_units": 54, "unit_label": "פרק"}
                ]
            }
        ]
    }
]