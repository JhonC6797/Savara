export function toHebrewNumeral(num) {
  if (!num || isNaN(num) || num <= 0) return '';

  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

  const n = Number(num);

  if (n % 100 === 15) {
    const prefix = toHebrewNumeral(Math.floor(n / 100) * 100).replace(/["']/g, '');
    return prefix + 'ט"ו';
  }
  if (n % 100 === 16) {
    const prefix = toHebrewNumeral(Math.floor(n / 100) * 100).replace(/["']/g, '');
    return prefix + 'ט"ז';
  }

  let res = '';
  let h = Math.floor(n / 100);
  while (h > 4) {
    res += 'ת';
    h -= 4;
  }
  if (h > 0) res += hundreds[h];

  let t = Math.floor((n % 100) / 10);
  res += tens[t];

  let u = n % 10;
  res += units[u];

  if (res.length === 1) return res + "'";
  if (res.length > 1) return res.slice(0, -1) + '"' + res.slice(-1);
  return String(num);
}

export function formatHebrewUnit(unitNum) {
  return toHebrewNumeral(Number(unitNum) || 1);
}