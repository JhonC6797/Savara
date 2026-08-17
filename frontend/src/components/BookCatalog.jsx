import React from 'react';
import { formatHebrewUnit } from '../utils/hebrewNumerals';

export default function BookCatalog({ catalog, onSelectSection }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', margin: '0 0 8px 0', fontWeight: '700' }}>
          ספריית סברא
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
          בחר ספר ונושא מבוקש לפתיחת מהדורת הלימוד
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '24px' }}>
        {catalog.map((book) => (
          <div
            key={book.id}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', letterSpacing: '0.5px', color: 'var(--accent-gold)', fontWeight: '600' }}>
                {book.category}
              </span>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '6px 0', color: 'var(--text-primary)' }}>
                {book.title}
              </h2>
              
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {book.author}
              </div>

              <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#44403c', margin: '0 0 20px 0' }}>
                {book.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                בחר נושא / חלק ללימוד:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {book.sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection(book, sec)}
                    style={{
                      textAlign: 'right',
                      fontSize: '14px',
                      padding: '8px 12px',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{sec.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {sec.is_single ? 'יחיד' : `עד ${sec.unit_name} ${formatHebrewUnit(sec.max_units)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}