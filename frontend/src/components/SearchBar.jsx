// frontend/src/components/SearchBar.jsx
import React, { useState } from "react";
import { searchTexts } from "../services/api";

const MATCH_LABELS = {
  exact: "התאמה מדויקת",
  all_words: "כל המילים",
  all_words_loose: "כל המילים (בהטיות)",
  partial: "תוצאות קרובות"
};

// ה-snippet מגיע עם « » סביב המילים שנמצאו. מפצלים ומרנדרים כאלמנטים,
// בלי להזריק HTML, כדי לא לפתוח פרצת XSS בטקסט שמגיע מהשרת.
function renderSnippet(snippet) {
  return String(snippet || "")
    .split(/«|»/)
    .map((part, i) =>
      i % 2 === 1
        ? <mark key={i} style={{ backgroundColor: "#fde68a", padding: "0 2px", borderRadius: "3px" }}>{part}</mark>
        : <span key={i}>{part}</span>
    );
}

const BOOKS_OPTIONS = [
  { id: "all", title: "כל הספרים" },
  { id: "mishneh_torah", title: "משנה תורה (הרמב''ם)" },
  { id: "shulchan_arukh", title: "שולחן ערוך" },
  { id: "guide_for_the_perplexed", title: "מורה נבוכים" },
  { id: "mesillat_yesharim", title: "מסילת ישרים" }
];

export default function SearchBar({ onSelectResult }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [results, setResults] = useState([]);
  const [matchType, setMatchType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchTexts(query, selectedBook);
      setResults(data.results || []);
      setMatchType(data.match_type);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setMatchType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hit) => {
    setIsModalOpen(false);
    setQuery("");
    setResults([]);
    setMatchType(null);
    onSelectResult?.(hit.nav);
  };

  return (
    <>
      {/* כפתור צף בפינת המסך התחתונה */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: "fixed",
          bottom: "25px",
          left: "25px",
          backgroundColor: "#2c3e50",
          color: "#ffffff",
          border: "none",
          borderRadius: "50px",
          padding: "12px 22px",
          fontSize: "15px",
          fontWeight: "bold",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          direction: "rtl"
        }}
      >
        <span>🔍</span>
        <span>חיפוש חכם</span>
      </button>

      {/* חלון החיפוש הקופץ (Modal Overlay) */}
      {isModalOpen && (
        <div className="search-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            {/* כותרת החלון */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc"
              }}
            >
              <h3 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>חיפוש סמנטי בספרי היסוד</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#a0aec0"
                }}
              >
                ✕
              </button>
            </div>

            {/* טופס החיפוש */}
            <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <div className="search-fields">
                  <select
                    className="search-select"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                  >
                    {BOOKS_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>

                  <input
                    className="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="מילה או משפט לחיפוש..."
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "10px",
                    backgroundColor: "#2c3e50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px"
                  }}
                >
                  {loading ? "מחפש פסקאות מתאימות..." : "חפש ברחבי המאגר"}
                </button>
              </form>
            </div>

            {/* רשימת התוצאות */}
            <div style={{ padding: "10px 20px", overflowY: "auto", flex: 1 }}>
              {results.length === 0 && !loading && matchType && (
                <div style={{ textAlign: "center", color: "#a0aec0", padding: "30px 0" }}>
                  לא נמצאו פסקאות מתאימות לשאילתה זו.
                </div>
              )}

              {results.length > 0 && MATCH_LABELS[matchType] && (
                <div style={{ fontSize: "13px", color: "#64748b", padding: "4px 2px 10px" }}>
                  {MATCH_LABELS[matchType]} · {results.length} תוצאות
                </div>
              )}

              {results.map((hit) => (
                <div
                  key={hit.ref}
                  onClick={() => handleSelect(hit)}
                  style={{
                    padding: "14px 16px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    backgroundColor: "#f8fafc",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#edf2f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                >
                  {/* כותרת נקייה בעברית (למשל: משנה תורה, הלכות יסודי התורה - פרק ג' הלכה י') */}
                  <strong style={{ color: "#2b6cb0", fontSize: "15px", display: "block", marginBottom: "8px" }}>
                    {hit.display_title}
                  </strong>
                  <p style={{ margin: 0, fontSize: "14px", color: "#4a5568", lineHeight: "1.6" }}>
                    {renderSnippet(hit.snippet)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}