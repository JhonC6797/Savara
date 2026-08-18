import React, { useState } from 'react';

export default function BookCatalog({ catalog = [], onSelectSection }) {
  const [selectedBook, setSelectedBook] = useState(null);

  if (!catalog || catalog.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 'bold' }}>
        טוען ספרים...
      </div>
    );
  }

  // 1. תצוגת תוכן ספר שנבחר (קטגוריות והלכות)
  if (selectedBook) {
    const categories = selectedBook.categories || [];
    const directSections = selectedBook.sections || [];

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
        {/* סרגל עליון: כותרת וכפתור חזרה */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
              {selectedBook.title}
            </h2>
            {selectedBook.author && (
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {selectedBook.author}
              </p>
            )}
          </div>

          <button
            onClick={() => setSelectedBook(null)}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#334155',
              fontSize: '14px'
            }}
          >
            ➔ חזרה לכל הספרים
          </button>
        </div>

        {/* רשימת קטגוריות והלכות */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.length > 0 && categories.map((cat, idx) => (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              padding: '20px 24px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '14px', marginTop: 0 }}>
                {cat.name}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {cat.sections?.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection({ book: selectedBook, section: sec })}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      fontSize: '14px'
                    }}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {categories.length === 0 && directSections.length > 0 && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '20px 24px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {directSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection({ book: selectedBook, section: sec })}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      fontSize: '14px'
                    }}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. תצוגת קטלוג ראשי - כרטיסיות נקיות
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        ספריית היסוד
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {catalog.map((book) => (
          <div
            key={book.id || book.title}
            onClick={() => setSelectedBook(book)}
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 6px 0' }}>
              {book.title}
            </h3>
            {book.author && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                {book.author}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}