import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LANGUAGE_CODES, t } from '@/lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'English',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('display_language') as Language) || 'English';
  });

  // Apply html lang attribute and dir whenever language changes
  useEffect(() => {
    document.documentElement.lang = LANGUAGE_CODES[language];
    // RTL support for Arabic
    document.documentElement.dir = language === 'Arabic' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('display_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (key) => t(key, language) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
