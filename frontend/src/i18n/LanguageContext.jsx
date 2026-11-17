import { createContext, useContext, useMemo, useState } from 'react';
import { createTranslator } from './translations';

const LanguageContext = createContext(null);

function loadStoredLanguage() {
  try {
    return localStorage.getItem('hisab-language') || 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(loadStoredLanguage);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hisab-language', lang);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  };

  const value = useMemo(() => ({ language, setLanguage, t: createTranslator(language) }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
