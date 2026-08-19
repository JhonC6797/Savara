import React, { useState, useEffect } from 'react';
import { toHebrewNumeral, formatHebrewUnit } from '../utils/hebrewNumerals';
import { stripHtml } from '../utils/textUtils';

export default function ReaderView({
  textData,
  loading,
  selectedBookObj,
  selectedSectionObj,
  currentBookSections,
  currentUnit,
  highlightParagraph,
  onBack,
  onSectionSwitch,
  onUnitChange,
  onJumpSubmit
}) {
  const [jumpInput, setJumpInput] = useState(String(currentUnit));
  
  // טעינת גודל גופן מתוך localStorage
  const fontSize = localStorage.getItem('reader_font_size') || 'medium';
  const fontSizeClasses = {
    small: 'text-base leading-relaxed',
    medium: 'text-lg leading-loose',
    large: 'text-xl leading-loose'
  }[fontSize] || 'text-lg leading-loose';

  useEffect(() => {
    setJumpInput(String(currentUnit));
  }, [currentUnit]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "#2563eb", fontWeight: "bold" }}>
        טוען טקסט...
      </div>
    );
  }

  if (!textData || !selectedBookObj || !selectedSectionObj) return null;

  const maxUnits = selectedSectionObj.max_units || 1;
  const unitLabel = selectedSectionObj.unit_label || "יחידה";
  const paragraphs = Array.isArray(textData.sections) ? textData.sections : [];

  const handleJump = (e) => {
    e.preventDefault();
    onJumpSubmit(jumpInput);
  };

  return (
    <div 
      className="dark:bg-zinc-900 dark:border-zinc-800"
      style={{
        backgroundColor: "#ffffff",
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* סרגל עליון: חזרה ובחירת חטיבה/ספר */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          className="dark:bg-zinc-800 dark:text-slate-200"
          style={{
            backgroundColor: "#f1f5f9",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#334155",
            fontSize: "13px"
          }}
        >
          ➔ חזרה לקטלוג
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "100%" }}>
          <span style={{ fontWeight: "bold", fontSize: "15px", whiteSpace: "nowrap" }} className="dark:text-white">
            {selectedBookObj.title}:
          </span>
          
          <select
            value={selectedSectionObj.id}
            onChange={onSectionSwitch}
            className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#1e293b",
              backgroundColor: "#f8fafc",
              cursor: "pointer",
              direction: "rtl",
              maxWidth: "200px",
              textOverflow: "ellipsis"
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

      {/* סרגל מעבר בין יחידות/פרקים */}
      <div 
        className="dark:bg-zinc-800/60 dark:border-zinc-700/60"
        style={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          padding: "10px 12px",
          borderRadius: "10px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
          gap: "8px",
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <button
          onClick={() => onUnitChange(-1)}
          disabled={currentUnit <= 1}
          className="dark:bg-zinc-800 dark:text-slate-200"
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: currentUnit <= 1 ? "#e2e8f0" : "#ffffff",
            color: currentUnit <= 1 ? "#94a3b8" : "#1e293b",
            cursor: currentUnit <= 1 ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "12px"
          }}
        >
          ◄ {unitLabel} הקודם
        </button>

        <form onSubmit={handleJump} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", color: "#475569" }} className="dark:text-zinc-300">
            {unitLabel} {currentUnit} ({formatHebrewUnit(currentUnit)}) / {maxUnits}:
          </span>
          <input
            type="number"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            min={1}
            max={maxUnits}
            className="dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            style={{
              width: "50px",
              padding: "4px 6px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              textAlign: "center",
              fontSize: "13px"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#1e3a8a",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            עבור
          </button>
        </form>

        <button
          onClick={() => onUnitChange(1)}
          disabled={currentUnit >= maxUnits}
          className="dark:bg-zinc-800 dark:text-slate-200"
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: currentUnit >= maxUnits ? "#e2e8f0" : "#ffffff",
            color: currentUnit >= maxUnits ? "#94a3b8" : "#1e293b",
            cursor: currentUnit >= maxUnits ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "12px"
          }}
        >
          {unitLabel} הבא ►
        </button>
      </div>

      {/* גוף הטקסט */}
      <div className={fontSizeClasses} style={{ wordBreak: "break-word" }}>
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, idx) => {
            const isHighlighted = idx + 1 === highlightParagraph;
            return (
              <p
                key={idx}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: isHighlighted ? "#fef08a" : "transparent",
                  color: isHighlighted ? "#000000" : "inherit",
                  borderRight: isHighlighted ? "4px solid #eab308" : "none",
                  marginBottom: "8px"
                }}
              >
                <strong style={{ marginLeft: "8px", color: "#94a3b8", fontSize: "14px" }}>
                  [{toHebrewNumeral(idx + 1)}]
                </strong>
                {stripHtml(paragraph)}
              </p>
            );
          })
        ) : (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>אין טקסט להצגה ביחידה זו.</p>
        )}
      </div>
    </div>
  );
}