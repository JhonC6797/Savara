import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function SettingsPage({ onBack }) {
  const { isInstallable, installPWA, isIOS, isStandalone } = usePWAInstall();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('reader_font_size') || 'medium';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('reader_font_size', size);
  };

  const clearAppCache = () => {
    if (window.confirm("האם למחוק נתונים שמורים ולרענן?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* סרגל עליון */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-100 font-bold px-4 py-2 rounded-xl transition cursor-pointer text-sm sm:text-base"
          >
            <span>➔</span>
            <span>חזרה ללימוד</span>
          </button>
          
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ⚙️ הגדרות
          </h1>
          <div className="w-10"></div>
        </div>

        {/* תצוגה וגופן */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <span className="text-xl">👁️</span>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">תצוגה וחווית קריאה</h2>
          </div>

          {/* מתג מצב מוחשך */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-slate-800 dark:text-slate-200">מצב מוחשך (שחור)</div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">מעבר בין רקע בהיר לשחור מלא</div>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center text-xs ${
                  isDarkMode ? '-translate-x-7' : '-translate-x-1'
                }`}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </span>
            </button>
          </div>

          <hr className="border-slate-100 dark:border-zinc-800" />

          {/* גודל גופן */}
          <div className="space-y-3">
            <div>
              <div className="font-bold text-base text-slate-800 dark:text-slate-200">גודל גופן הלימוד</div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">בחר את גודל הטקסט בספרים</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'small', label: 'קטן' },
                { id: 'medium', label: 'בינוני' },
                { id: 'large', label: 'גדול' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFontSizeChange(item.id)}
                  className={`py-2.5 px-3 rounded-xl border font-bold transition text-sm cursor-pointer ${
                    fontSize === item.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* אפליקציה לנייד */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <span className="text-xl">📱</span>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">אפליקציה למחשב ולנייד</h2>
          </div>

          {isStandalone ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-sm">
              ✅ האפליקציה מותקנת ופעילה במכשירך
            </div>
          ) : isInstallable ? (
            <button
              onClick={installPWA}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow transition cursor-pointer"
            >
              📲 התקן אפליקציה בלחיצה
            </button>
          ) : isIOS ? (
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl">
              <p className="font-bold">להתקנה באייפון/אייפד (Safari):</p>
              <p>1. לחץ על כפתור השיתוף (Share) ⎋</p>
              <p>2. לחץ על 'הוסף למסך הבית' ➕</p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
              💡 במחשב או באנדרואיד ניתן ללחוץ על 3 הנקודות בדפדפן ולבחור <strong>"התקן אפליקציה"</strong>.
            </p>
          )}
        </div>

        {/* איפוס */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
          <button
            onClick={clearAppCache}
            className="w-full text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/40 transition cursor-pointer"
          >
            🧹 איפוס הגדרות ורענון זיכרון
          </button>
        </div>

      </div>
    </div>
  );
}