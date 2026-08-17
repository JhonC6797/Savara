// frontend/src/services/api.js
const BASE_URL = 'http://localhost:8000/api';

export async function fetchCatalog() {
  const res = await fetch(`${BASE_URL}/catalog`);
  return res.json();
}

export async function fetchText(ref) {
  const res = await fetch(`${BASE_URL}/text/${encodeURIComponent(ref)}`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}