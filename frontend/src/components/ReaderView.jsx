import React, { useState, useEffect } from 'react';
import { toHebrewNumeral, formatHebrewUnit } from '../utils/hebrewNumerals';

export default function ReaderView({ content, loading, currentBook, currentSection, currentUnit, onBack, onNavigateToUnit, onSelectSection }) {
  const [inputUnit, setInputUnit] = useState(currentUnit);

  useEffect(() => {
    setInputUnit(currentUnit);
  }, [currentUnit]);

  const handleJump = (e) => {
    e.preventDefault();
    if (currentSection.is_single) return;
    
    let unitNum = parseInt(inputUnit, 10);
    if (isNaN(unitNum) || unitNum < 1) unitNum = 1;
    if (unitNum > currentSection.max_units) unitNum = currentSection.max_units;

    onNavigateToUnit(unitNum);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '760px', margin: '80px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>טוען את המקור...</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
      
      {/* סרגל עליון */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button onClick={onBack} style={{ fontSize: '14px' }}>
          → חזרה לקטלוג
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={currentSection.id}
            onChange={(e) => {
              const targetSec = currentBook.sections.find(s => s.id === e.target.value);
              if (targetSec) onSelectSection(currentBook, targetSec);
            }}
            style={{ padding: '6px 10px', fontSize: '14px', border: '1px solid var(--border-color)' }}
          >
            {currentBook.sections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* ניווט ישיר לפי מספר פרק/סימן עם אותיות עבריות */}
          {!currentSection.is_single && (
            <form onSubmit={handleJump} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{currentSection.unit_name}:</span>
              <input
                type="number"
                min="1"
                max={currentSection.max_units}
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value)}
                style={{
                  width: '55px',
                  padding: '5px',
                  fontSize: '14px',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-gold)' }}>
                {toHebrewNumeral(Number(inputUnit) || 1)}
              </span>
              <button type="submit" style={{ padding: '5px 10px', fontSize: '13px' }}>עבור</button>
            </form>
          )}
        </div>
      </div>

      {/* כותרת הפרק/הסימן */}
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', margin: '0 0 8px 0' }}>
          {content.title}
        </h1>
        {!currentSection.is_single && (
          <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {currentSection.unit_name} {formatHebrewUnit(currentUnit)}
          </div>
        )}
        <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--accent-gold)', margin: '0 auto' }} />
      </header>

      {/* גוף הטקסט – סעיפים/הלכות ממוספרים באותיות עבריות [א'], [ב'], [ג'] */}
      <article style={{ fontFamily: 'var(--font-serif)', fontSize: '21px', lineHeight: '2.0', textAlign: 'justify' }}>
        {content.sections.map((paragraph, idx) => (
          <div key={idx} style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0ede6' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', marginLeft: '10px', fontFamily: 'var(--font-serif)', fontSize: '19px' }}>
              [{toHebrewNumeral(idx + 1)}]
            </span>
            {paragraph}
          </div>
        ))}
      </article>

      {/* דפדוף רציף למטה */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <div>
          {currentUnit > 1 && !currentSection.is_single && (
            <button onClick={() => onNavigateToUnit(currentUnit - 1)}>
              ➔ {currentSection.unit_name} {formatHebrewUnit(currentUnit - 1)}
            </button>
          )}
        </div>

        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {currentSection.unit_name} {toHebrewNumeral(currentUnit)}
        </span>

        <div>
          {currentUnit < currentSection.max_units && !currentSection.is_single && (
            <button 
              onClick={() => onNavigateToUnit(currentUnit + 1)}
              style={{ backgroundColor: 'var(--text-primary)', color: '#fff', borderColor: 'var(--text-primary)' }}
            >
              {currentSection.unit_name} {formatHebrewUnit(currentUnit + 1)} 
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}