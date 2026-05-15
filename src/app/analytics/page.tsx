"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Analytics() {
  const { t } = useLang();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-dashboard" }),
      });

      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-dashboard" }),
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Analytics error:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <span className="text-sm">{t.analytics.backToApp}</span>
        </Link>
        <span className="font-bold text-white">{t.analytics.navTitle}</span>
        <LanguageSwitcher />
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">📊 {t.analytics.pageTitle}</h1>
          <p className="text-gray-400">
            {t.analytics.pageSubtitle}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">{t.analytics.loadingMetrics}</p>
          </div>
        ) : (
          <>
            {/* Alerts */}
            {metrics?.alerts && metrics.alerts.length > 0 && (
              <div className="mb-8 space-y-2">
                {metrics.alerts.map((alert: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{
                      background: alert.includes("healthy")
                        ? "rgba(34,197,94,0.1)"
                        : alert.includes("🚨")
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(245,158,11,0.1)",
                      border:
                        alert.includes("healthy")
                          ? "1px solid rgba(34,197,94,0.3)"
                          : alert.includes("🚨")
                            ? "1px solid rgba(239,68,68,0.3)"
                            : "1px solid rgba(245,158,11,0.3)",
                    }}>
                    {alert.includes("healthy") ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#86efac" }} />
                    ) : alert.includes("🚨") ? (
                      <AlertCircle className="w-5 h-5" style={{ color: "#f87171" }} />
                    ) : (
                      <AlertCircle className="w-5 h-5" style={{ color: "#fbbf24" }} />
                    )}
                    <span className="text-sm text-white">{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: t.analytics.totalMeetings,
                  value: metrics?.totalMeetings || 0,
                  icon: "📅",
                  color: "#6366f1",
                },
                {
                  label: t.analytics.actionItemsCreated,
                  value: metrics?.totalTasksCreated || 0,
                  icon: "🎯",
                  color: "#8b5cf6",
                },
                {
                  label: t.analytics.completionRate,
                  value: `${metrics?.completionRate || 0}%`,
                  icon: "✅",
                  color: "#34d399",
                },
                {
                  label: t.analytics.overdueTasks,
                  value: metrics?.overdueTasksCount || 0,
                  icon: "⚠️",
                  color: "#f87171",
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{metric.icon}</div>
                    <TrendingUp className="w-4 h-4" style={{ color: metric.color }} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Performance Card */}
            <div
              className="rounded-xl p-6 mb-8"
              style={{
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t.analytics.performanceSummary}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.analytics.avgTasksMeeting}</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics?.averageTasksPerMeeting || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.analytics.completedTasks}</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics?.totalTasksCompleted || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.analytics.status}</p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color:
                        (metrics?.completionRate || 0) >= 70
                          ? "#86efac"
                          : "#f87171",
                    }}>
                    {(metrics?.completionRate || 0) >= 70 ? t.analytics.healthy : t.analytics.atRisk}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setLoading(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {t.analytics.refreshData}
              </button>
              <Link
                href="/knowledge-base"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
                {t.analytics.viewKnowledgeBase}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
