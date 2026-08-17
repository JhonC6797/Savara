// frontend/src/utils/hebrewNumerals.js

export function toHebrewNumeral(num) {
  if (typeof num !== 'number' || num <= 0) return num;

  let n = num;
  let str = '';

  // מאות
  while (n >= 400) { str += 'ת'; n -= 400; }
  if (n >= 300) { str += 'ש'; n -= 300; }
  if (n >= 200) { str += 'ר'; n -= 200; }
  if (n >= 100) { str += 'ק'; n -= 100; }

  // עשרות ויחידות (טיפול במקרי ט"ו ו-ט"ז)
  if (n === 15) {
    str += 'טו';
    n = 0;
  } else if (n === 16) {
    str += 'טז';
    n = 0;
  } else {
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    str += tens[Math.floor(n / 10)];
    n %= 10;

    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    str += ones[n];
  }

  if (str.length === 0) return '';
  if (str.length === 1) return str + "'";
  return str.slice(0, -1) + '"' + str.slice(-1);
}

// פורמט משולב: אותיות עבריות עם מספר בסוגריים, למשל: "ה' (5)" או "רכ"ח (228)"
export function formatHebrewUnit(num) {
  if (!num) return '';
  const heb = toHebrewNumeral(num);
  return `${heb} (${num})`;
}