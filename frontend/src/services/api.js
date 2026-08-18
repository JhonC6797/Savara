// frontend/src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getCatalog = async () => {
  const res = await fetch(`${API_BASE_URL}/api/catalog`);
  if (!res.ok) throw new Error("Failed to fetch catalog");
  return await res.json();
};

export const getTextSection = async (bookId, sectionId, unit = 1) => {
  const res = await fetch(`${API_BASE_URL}/api/text/${bookId}/${sectionId}?unit=${unit}`);
  if (!res.ok) throw new Error("Failed to fetch text");
  return await res.json();
};

// פונקציית החיפוש הסמנטי
export const searchTexts = async (query, bookId = "all") => {
  if (!query || query.trim().length < 2) return [];
  
  let url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`;
  if (bookId && bookId !== "all") {
    url += `&book_id=${encodeURIComponent(bookId)}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Search request failed");
  return await res.json();
};