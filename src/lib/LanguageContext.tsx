"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Lang } from "./translations";

type AnyTranslations = (typeof translations)["en"] | (typeof translations)["fr"];

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: AnyTranslations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
