import React, { useState, useEffect, useMemo } from "react";
import BookCatalog from "./components/BookCatalog";
import SearchBar from "./components/SearchBar";
import ReaderView from "./components/ReaderView";
import SettingsPage from "./components/SettingsPage";
import { getCatalog, getTextSection } from "./services/api";

export default function App() {
  const [view, setView] = useState("catalog");
  const [previousView, setPreviousView] = useState("catalog");
  
  const [catalog, setCatalog] = useState([]);
  const [selectedBookObj, setSelectedBookObj] = useState(null);
  const [selectedSectionObj, setSelectedSectionObj] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(1);
  
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

  const handleJumpSubmit = (unitInput) => {
    fetchAndShowText(selectedBookObj, selectedSectionObj, unitInput, null);
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

  if (view === "settings") {
    return <SettingsPage onBack={() => setView(previousView)} />;
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors w-full overflow-x-hidden"
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        direction: "rtl",
        textAlign: "right",
        boxSizing: "border-box"
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
        <h1 style={{ color: "#1e3a8a", margin: "0 0 6px 0", fontSize: "26px", fontWeight: "bold" }} className="dark:text-white">
          סברא - מנוע לימוד תורני
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }} className="dark:text-zinc-400">
          קריאה, עיון וחיפוש סמנטי בספרי יסוד
        </p>
      </header>

      <SearchBar onSelectResult={handleSelectFromSearch} />

      {/* מסך קריאה בספר */}
      {view === "reader" && (
        <ReaderView
          textData={textData}
          loading={loading}
          selectedBookObj={selectedBookObj}
          selectedSectionObj={selectedSectionObj}
          currentBookSections={currentBookSections}
          currentUnit={currentUnit}
          highlightParagraph={highlightParagraph}
          onBack={() => setView("catalog")}
          onSectionSwitch={handleSectionSwitch}
          onUnitChange={handleUnitChange}
          onJumpSubmit={handleJumpSubmit}
        />
      )}

      {/* מסך קטלוג */}
      {view === "catalog" && !loading && (
        <BookCatalog 
          catalog={catalog} 
          onSelectSection={handleSelectFromCatalog} 
        />
      )}
    </div>
  );
}