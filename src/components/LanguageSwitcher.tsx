"use client";

import { useLang } from "@/lib/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-3 py-1.5 text-xs font-bold transition-colors uppercase"
          style={{
            background: lang === l ? "rgba(99,102,241,0.35)" : "transparent",
            color: lang === l ? "#a5b4fc" : "#6b7280",
          }}>
          {l}
        </button>
      ))}
    </div>
  );
}
