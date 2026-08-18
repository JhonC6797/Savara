// frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import BookCatalog from "./components/BookCatalog";
import SearchBar from "./components/SearchBar";
import SettingsPage from "./components/SettingsPage";
import { getCatalog, getTextSection } from "./services/api";

const stripHtml = (htmlString) => {
  if (typeof htmlString !== "string") return htmlString;
  return htmlString
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function App() {
  const [view, setView] = useState("catalog"); // 'catalog' | 'reader' | 'settings'
  const [previousView, setPreviousView] = useState("catalog");
  
  const [catalog, setCatalog] = useState([]);
  const [selectedBookObj, setSelectedBookObj] = useState(null);
  const [selectedSectionObj, setSelectedSectionObj] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(1);
  const [jumpInput, setJumpInput] = useState("1");
  
  const [textData, setTextData] = useState(null);
  const [highlightParagraph, setHighlightParagraph] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCatalog()
      .then((data) => setCatalog(data || []))
      .catch((err) => console.error("Error fetching catalog:", err));
  }, []);

  const openSettings = () => {
    setPreviousView(view);
    setView("settings");
  };

  const findSectionInCatalog = (catalogList, bookId, sectionId) => {
    const book = catalogList.find((b) => b.id === bookId);
    if (!book) return { book: null, section: null };
    
    if (Array.isArray(book.categories)) {
      for (const cat of book.categories) {
        const section = cat.sections?.find((s) => s.id === sectionId);
        if (section) return { book, section };
      }
    }
    
    if (Array.isArray(book.sections)) {
      const section = book.sections.find((s) => s.id === sectionId);
      if (section) return { book, section };
    }

    return { book, section: null };
  };

  const fetchAndShowText = async (bookObj, sectionObj, unitNum, pHighlight = null) => {
    if (!sectionObj) return;

    const maxUnits = sectionObj.max_units || 1;
    let validUnit = parseInt(unitNum, 10);
    if (isNaN(validUnit) || validUnit < 1) validUnit = 1;
    if (validUnit > maxUnits) validUnit = maxUnits;

    setLoading(true);
    try {
      const data = await getTextSection(bookObj.id, sectionObj.id, validUnit);
      setSelectedBookObj(bookObj);
      setSelectedSectionObj(sectionObj);
      setCurrentUnit(validUnit);
      setJumpInput(String(validUnit));
      setTextData(data);
      setHighlightParagraph(pHighlight);
      setView("reader");
    } catch (err) {
      console.error("Error loading section:", err);
      alert(`לא ניתן היה לטעון את הטקסט עבור "${sectionObj.name}".`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromCatalog = (data) => {
    if (data.book && data.section) {
      fetchAndShowText(data.book, data.section, 1, null);
      return;
    }
    const { bookId, sectionId } = data;
    const { book, section } = findSectionInCatalog(catalog, bookId, sectionId);
    if (book && section) {
      fetchAndShowText(book, section, 1, null);
    }
  };

  const handleSelectFromSearch = (payload) => {
    const { book, section } = findSectionInCatalog(catalog, payload.book_id, payload.section_id);
    if (book && section) {
      fetchAndShowText(book, section, payload.unit_number, payload.paragraph_number);
    }
  };

  const handleSectionSwitch = (e) => {
    const newSectionId = e.target.value;
    const { section } = findSectionInCatalog(catalog, selectedBookObj.id, newSectionId);
    if (section) {
      fetchAndShowText(selectedBookObj, section, 1, null);
    }
  };

  const handleUnitChange = (delta) => {
    fetchAndShowText(selectedBookObj, selectedSectionObj, currentUnit + delta, null);
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    fetchAndShowText(selectedBookObj, selectedSectionObj, jumpInput, null);
  };

  const currentBookSections = useMemo(() => {
    if (!selectedBookObj) return [];
    if (Array.isArray(selectedBookObj.categories)) {
      return selectedBookObj.categories.flatMap((c) => c.sections || []);
    }
    if (Array.isArray(selectedBookObj.sections)) {
      return selectedBookObj.sections;
    }
    return [];
  }, [selectedBookObj]);

  const maxUnits = selectedSectionObj?.max_units || 1;
  const unitLabel = selectedSectionObj?.unit_label || "יחידה";
  const paragraphs = Array.isArray(textData?.sections) ? textData.sections : [];

  // הצגת מסך ההגדרות במצב מסך מלא
  if (view === "settings") {
    return <SettingsPage onBack={() => setView(previousView)} />;
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors"
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        direction: "rtl",
        textAlign: "right"
      }}
    >
      {/* כפתור הגדרות צף */}
      <button
        onClick={openSettings}
        className="fixed top-4 left-4 z-40 bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-100 p-3 rounded-full shadow-md border border-slate-200 dark:border-zinc-700 text-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="הגדרות"
      >
        ⚙️
      </button>

      {/* כותרת ראשית */}
      <header style={{ textAlign: "center", marginBottom: "20px", marginTop: "10px" }}>
        <h1 style={{ color: "#1e3a8a", margin: "0 0 6px 0", fontSize: "28px", fontWeight: "bold" }} className="dark:text-white">
          סברא - מנוע לימוד תורני
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }} className="dark:text-zinc-400">
          קריאה, עיון וחיפוש סמנטי בספרי יסוד
        </p>
      </header>

      {/* רכיב חיפוש */}
      <SearchBar onSelectResult={handleSelectFromSearch} />

      {/* הודעת טעינה */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "#2563eb", fontWeight: "bold" }}>
          טוען טקסט...
        </div>
      )}

      {/* מסך קריאה בספר */}
      {view === "reader" && !loading && textData && selectedBookObj && selectedSectionObj && (
        <div 
          className="dark:bg-zinc-900 dark:border-zinc-800"
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}
        >
          {/* סרגל ניווט עליון בתוך הספר */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setView("catalog")}
              className="dark:bg-zinc-800 dark:text-slate-200"
              style={{
                backgroundColor: "#f1f5f9",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#334155",
                fontSize: "14px"
              }}
            >
              ➔ חזרה לקטלוג
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "16px" }} className="dark:text-white">
                {selectedBookObj.title}:
              </span>
              
              <select
                value={selectedSectionObj.id}
                onChange={handleSectionSwitch}
                className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  direction: "rtl"
                }}
              >
                {currentBookSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* סרגל ניווט יחידות / פרקים */}
          <div 
            className="dark:bg-zinc-800/60 dark:border-zinc-700/60"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8fafc",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #e2e8f0",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => handleUnitChange(-1)}
              disabled={currentUnit <= 1}
              className="dark:bg-zinc-800 dark:text-slate-200"
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: currentUnit <= 1 ? "#e2e8f0" : "#ffffff",
                color: currentUnit <= 1 ? "#94a3b8" : "#1e293b",
                cursor: currentUnit <= 1 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              ◄ {unitLabel} הקודם
            </button>

            <form onSubmit={handleJumpSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#475569" }} className="dark:text-zinc-300">
                {unitLabel} {currentUnit} מתוך {maxUnits}:
              </span>
              <input
                type="number"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                min={1}
                max={maxUnits}
                className="dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
                style={{
                  width: "60px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  textAlign: "center",
                  fontSize: "14px"
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                עבור
              </button>
            </form>

            <button
              onClick={() => handleUnitChange(1)}
              disabled={currentUnit >= maxUnits}
              className="dark:bg-zinc-800 dark:text-slate-200"
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: currentUnit >= maxUnits ? "#e2e8f0" : "#ffffff",
                color: currentUnit >= maxUnits ? "#94a3b8" : "#1e293b",
                cursor: currentUnit >= maxUnits ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              {unitLabel} הבא ►
            </button>
          </div>

          {/* גוף הטקסט */}
          <div style={{ lineHeight: "2.1", fontSize: "18px" }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, idx) => {
                const isHighlighted = idx + 1 === highlightParagraph;
                return (
                  <p
                    key={idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: isHighlighted ? "#fef08a" : "transparent",
                      color: isHighlighted ? "#000000" : "inherit",
                      borderRight: isHighlighted ? "4px solid #eab308" : "none",
                      marginBottom: "8px"
                    }}
                  >
                    <strong style={{ marginLeft: "10px", color: "#94a3b8", fontSize: "14px" }}>[{idx + 1}]</strong>
                    {stripHtml(paragraph)}
                  </p>
                );
              })
            ) : (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>אין טקסט להצגה ביחידה זו.</p>
            )}
          </div>
        </div>
      )}

      {/* מסך קטלוג ספרים */}
      {view === "catalog" && !loading && (
        <BookCatalog 
          catalog={catalog} 
          onSelectSection={handleSelectFromCatalog} 
        />
      )}
    </div>
  );
}