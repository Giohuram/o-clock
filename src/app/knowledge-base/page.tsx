"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, Users, Zap } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function KnowledgeBase() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "decisions" | "meetings">("all");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: searchType === "decisions" ? "get-decisions-by-topic" : "search",
          query,
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0b0f" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 md:px-12 py-4 sticky top-0 z-50"
        style={{
          background: "rgba(10,11,15,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
        <Link href="/app" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t.kb.backToApp}</span>
        </Link>
        <span className="font-bold text-white">{t.kb.navTitle}</span>
        <LanguageSwitcher />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            🧠 {t.kb.pageTitle}
          </h1>
          <p className="text-gray-400">
            {t.kb.pageSubtitle}
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <input
              type="text"
              placeholder={`Try: ${t.kb.placeholder}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 rounded-lg outline-none text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? t.kb.searching : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* Search Type Selector */}
          <div className="flex items-center gap-2 px-4 py-3 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {["all", "decisions", "meetings"].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  searchType === type ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                style={{
                  background:
                    searchType === type
                      ? "rgba(99,102,241,0.3)"
                      : "transparent",
                  border: "1px solid " + (searchType === type ? "rgba(99,102,241,0.5)" : "transparent"),
                }}>
                {type === "all" ? t.kb.allResults : type === "decisions" ? t.kb.decisionsOnly : t.kb.meetingsOnly}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              {t.kb.found} {results.length} {results.length !== 1 ? t.kb.results : t.kb.result}
            </h2>
            {results.map((result, idx) => (
              <div
                key={idx}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(99,102,241,0.05)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex-1">
                    {result.title || result.date}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(result.date || result.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {result.participants && result.participants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Users className="w-4 h-4" />
                    <span>{result.participants.join(", ")}</span>
                  </div>
                )}

                {result.decisions && result.decisions.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: "#fbbf24" }} />
                      {t.kb.keyDecisions}
                    </h4>
                    <ul className="space-y-1">
                      {result.decisions.map((decision: string, i: number) => (
                        <li key={i} className="text-sm text-gray-400">
                          • {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.report && (
                  <p className="text-sm text-gray-400 line-clamp-3">{result.report.slice(0, 300)}...</p>
                )}

                <button
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  {t.kb.viewFullReport}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t.kb.noResults} "{query}"</p>
            <p className="text-gray-600 text-sm">{t.kb.noResultsTip}</p>
          </div>
        )}

        {!query && results.length === 0 && (
          <div className="grid grid-cols-3 gap-4 mt-12">
            {t.kb.statsPlaceholder.map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-5 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="font-bold text-white text-lg">{stat.title}</div>
                <div className="text-sm text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
