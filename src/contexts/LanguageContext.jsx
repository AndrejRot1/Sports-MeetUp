
import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import sl from '@/locales/sl.json';

const translations = {
  en,
  sl
};

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('sportsMeetupLanguage') || 'en');

  useEffect(() => {
    localStorage.setItem('sportsMeetupLanguage', language);
  }, [language]);

  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
    });
    return translation;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
