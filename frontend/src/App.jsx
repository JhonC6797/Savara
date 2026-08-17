import React, { useState, useEffect } from 'react';
import { fetchCatalog, fetchText } from './services/api';
import BookCatalog from './components/BookCatalog';
import ReaderView from './components/ReaderView';

export default function App() {
  const [catalog, setCatalog] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(1);
  
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(console.error);
  }, []);

  const handleSelectSection = (book, section) => {
    setCurrentBook(book);
    setCurrentSection(section);
    setCurrentUnit(1);
    
    const targetRef = section.is_single ? section.base_ref : `${section.base_ref}.1`;
    loadText(targetRef);
  };

  const handleNavigateToUnit = (unitNumber) => {
    setCurrentUnit(unitNumber);
    const targetRef = `${currentSection.base_ref}.${unitNumber}`;
    loadText(targetRef);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadText = (ref) => {
    setLoading(true);
    fetchText(ref)
      .then(setTextContent)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {!currentSection ? (
        <BookCatalog catalog={catalog} onSelectSection={handleSelectSection} />
      ) : (
        <ReaderView
          content={textContent}
          loading={loading}
          currentBook={currentBook}
          currentSection={currentSection}
          currentUnit={currentUnit}
          onBack={() => { setCurrentSection(null); setCurrentBook(null); }}
          onNavigateToUnit={handleNavigateToUnit}
          onSelectSection={handleSelectSection}
        />
      )}
    </div>
  );
}