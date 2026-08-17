// frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import BookCatalog from "./components/BookCatalog";
import SearchBar from "./components/SearchBar";
import { getCatalog, getTextSection } from "./services/api";

const stripHtml = (htmlString) => {
  if (typeof htmlString !== "string") return htmlString;
  return htmlString
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function App() {
  const [view, setView] = useState("catalog");
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

  // בתוך frontend/src/App.jsx

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
    alert(`לא ניתן היה שטוען את הטקסט עבור "${sectionObj.name}". ודא ששרת האינטרנט זמין.`);
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

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", direction: "rtl" }}>
      <header style={{ textAlign: "center", marginBottom: "25px" }}>
        <h1 style={{ color: "#2c3e50", margin: "0 0 6px 0" }}>סברא - מנוע לימוד תורני</h1>
        <p style={{ color: "#7f8c8d", margin: 0 }}>קריאה, עיון וחיפוש סמנטי בספרי יסוד</p>
      </header>

      <SearchBar onSelectResult={handleSelectFromSearch} />

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "#2b6cb0" }}>
          טוען טקסט...
        </div>
      )}

      {view === "reader" && !loading && textData && selectedBookObj && selectedSectionObj && (
        <div style={{ background: "#ffffff", padding: "25px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #edf2f7", paddingBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setView("catalog")}
              style={{ background: "#edf2f7", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#2d3748" }}
            >
              ➔ חזרה לקטלוג
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: "bold", color: "#2c3e50" }}>{selectedBookObj.title}:</span>
              
              <select
                value={selectedSectionObj.id}
                onChange={handleSectionSwitch}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e2e8f0", gap: "10px", flexWrap: "wrap" }}>
            
            <button
              onClick={() => handleUnitChange(-1)}
              disabled={currentUnit <= 1}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: currentUnit <= 1 ? "#e2e8f0" : "#ffffff",
                color: currentUnit <= 1 ? "#94a3b8" : "#1e293b",
                cursor: currentUnit <= 1 ? "not-allowed" : "pointer"
              }}
            >
              ◄ {unitLabel} הקודם
            </button>

            <form onSubmit={handleJumpSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#475569" }}>
                {unitLabel} {currentUnit} מתוך {maxUnits}:
              </span>
              <input
                type="number"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                min={1}
                max={maxUnits}
                style={{ width: "65px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", textAlign: "center" }}
              />
              <button type="submit" style={{ padding: "4px 10px", borderRadius: "4px", border: "none", background: "#2c3e50", color: "#fff", cursor: "pointer", fontSize: "13px" }}>
                עבור
              </button>
            </form>

            <button
              onClick={() => handleUnitChange(1)}
              disabled={currentUnit >= maxUnits}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: currentUnit >= maxUnits ? "#e2e8f0" : "#ffffff",
                color: currentUnit >= maxUnits ? "#94a3b8" : "#1e293b",
                cursor: currentUnit >= maxUnits ? "not-allowed" : "pointer"
              }}
            >
              {unitLabel} הבא ►
            </button>
          </div>

          <div style={{ lineHeight: "2.0", fontSize: "18px", color: "#2d3748" }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, idx) => {
                const isHighlighted = idx + 1 === highlightParagraph;
                return (
                  <p
                    key={idx}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: isHighlighted ? "#fef08a" : "transparent",
                      borderRight: isHighlighted ? "4px solid #eab308" : "none",
                      transition: "background-color 0.3s"
                    }}
                  >
                    <strong style={{ marginLeft: "10px", color: "#a0aec0", fontSize: "14px" }}>[{idx + 1}]</strong>
                    {stripHtml(paragraph)}
                  </p>
                );
              })
            ) : (
              <p style={{ color: "#a0aec0", textAlign: "center" }}>אין טקסט להצגה ביחידה זו.</p>
            )}
          </div>
        </div>
      )}

      {view === "catalog" && !loading && (
        <BookCatalog onSelectSection={handleSelectFromCatalog} />
      )}
    </div>
  );
}