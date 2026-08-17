// frontend/src/components/BookCatalog.jsx
import React, { useEffect, useState } from "react";
import { getCatalog } from "../services/api";

export default function BookCatalog({ onSelectSection }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    getCatalog()
      .then((data) => setCatalog(data || []))
      .catch((err) => console.error("Error loading catalog:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "30px", fontSize: "16px", color: "#2b6cb0" }}>טוען קטלוג ספרים...</div>;
  }

  if (selectedBook) {
    return (
      <div style={{ direction: "rtl", marginTop: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
          <button
            onClick={() => setSelectedBook(null)}
            style={{
              background: "#edf2f7",
              border: "1px solid #cbd5e1",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#2d3748"
            }}
          >
            ➔ חזרה לכל הספרים
          </button>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: 0, color: "#1a202c", fontSize: "22px" }}>{selectedBook.title}</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}>{selectedBook.description}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedBook.categories?.map((cat, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "18px",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", color: "#1e3a8a", fontSize: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                {cat.name}
              </h3>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {cat.sections?.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() =>
                      onSelectSection({
                        book: selectedBook,
                        section: sec
                      })
                    }
                    style={{
                      padding: "10px 16px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#334155"
                    }}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: "rtl", marginTop: "10px" }}>
      <h2 style={{ color: "#2c3e50", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px", marginBottom: "20px" }}>
        ספריית היסוד
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {Array.isArray(catalog) &&
          catalog.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                padding: "20px",
                background: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontSize: "20px" }}>{book.title}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>{book.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}