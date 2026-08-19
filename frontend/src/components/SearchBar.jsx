// frontend/src/components/SearchBar.jsx
import React, { useState } from "react";
import { searchTexts } from "../services/api";

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
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchTexts(query, selectedBook);
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hit) => {
    setIsModalOpen(false);
    setQuery("");
    setResults([]);
    
    if (onSelectResult) {
      // מעביר את פרטי הניווט המדויקים (nav) יחד עם ה-payload המלא
      onSelectResult(hit.nav ? { ...hit.nav, payload: hit.payload } : hit.payload);
    }
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            direction: "rtl"
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "680px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "14px",
                      direction: "rtl"
                    }}
                  >
                    {BOOKS_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="הקלד שאלה או נושא (למשל: מה העניין של תשובה)..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "15px",
                      direction: "rtl"
                    }}
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
              {results.length === 0 && !loading && query && (
                <div style={{ textAlign: "center", color: "#a0aec0", padding: "30px 0" }}>
                  לא נמצאו פסקאות מתאימות לשאילתה זו.
                </div>
              )}

              {results.map((hit, idx) => (
                <div
                  key={idx}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    {/* כותרת נקייה בעברית (למשל: משנה תורה, הלכות יסודי התורה - פרק ג' הלכה י') */}
                    <strong style={{ color: "#2b6cb0", fontSize: "15px" }}>
                      {hit.display_title || `${hit.payload.book_title} - ${hit.payload.section_name}`}
                    </strong>
                    <span style={{ fontSize: "12px", backgroundColor: "#ebf8ff", color: "#2b6cb0", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                      {hit.score}% התאמה
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#4a5568", lineHeight: "1.6" }}>
                    {hit.payload.text}
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