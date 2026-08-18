import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function SettingsModal({ isOpen, onClose }) {
  const { isInstallable, installPWA } = usePWAInstall();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative dir-rtl">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-center">הגדרות</h2>

        <div className="space-y-6">
          {/* ממתג מצב כהה/מואר */}
          <div className="flex items-center justify-between">
            <span className="font-medium">מצב מוחשך</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
                isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* כפתור התקנה לנייד */}
          <div>
            <h3 className="font-medium mb-2">אפליקציה לנייד</h3>
            {isInstallable ? (
              <button
                onClick={installPWA}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition"
              >
                📲 התקן אפליקציה לנייד
              </button>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                האפליקציה כבר מותקנת או שאינה נתמכת בדפדפן זה (ב-iOS: לחץ על 'שיתוף' $\rightarrow$ 'הוסף למסך הבית').
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}