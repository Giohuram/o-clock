"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  FileText,
  CheckSquare,
  MessageSquare,
  Database,
  Zap,
  BarChart3,
  ArrowRight,
  Clock,
  Shield,
  Globe,
} from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MeetingPlannerModal, { type MeetingData } from "@/components/MeetingPlannerModal";

const skillIcons = [Brain, FileText, CheckSquare, MessageSquare, Database, Zap, BarChart3];
const skillColors = ["#6366f1", "#8b5cf6", "#a78bfa", "#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa"];
const featureIcons = [Clock, Shield, Globe];
const featureColors = ["#6366f1", "#8b5cf6", "#a78bfa"];

export default function Home() {
  const { t } = useLang();
  const router = useRouter();
  const [plannerOpen, setPlannerOpen] = useState(false);

  const handleStartMeeting = (data: MeetingData) => {
    sessionStorage.setItem("oclock_meeting", JSON.stringify(data));
    router.push("/app");
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0b0f" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "rgba(10,11,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">O&apos;Clock AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#skills" className="text-sm text-gray-400 hover:text-white transition-colors">{t.nav.skills}</a>
          <a href="#how" className="text-sm text-gray-400 hover:text-white transition-colors">{t.nav.how}</a>
          <a href="#stats" className="text-sm text-gray-400 hover:text-white transition-colors">{t.nav.results}</a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            id="nav-launch-demo-btn"
            onClick={() => setPlannerOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", cursor: "pointer" }}>
            {t.nav.tryDemo}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 60%)"
        }} />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          {t.hero.badge}
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl mb-6">
          {t.hero.h1a}
          <br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t.hero.h1b}
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            id="hero-launch-demo-btn"
            onClick={() => setPlannerOpen(true)}
            className="glow-btn px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", cursor: "pointer" }}>
            {t.hero.cta}
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
          <a href="#skills"
            className="px-8 py-4 rounded-xl font-semibold text-gray-300 text-lg transition-all hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
            {t.hero.seeSkills}
          </a>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6"
        style={{ background: "rgba(99,102,241,0.05)", borderTop: "1px solid rgba(99,102,241,0.15)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black mb-2" style={{ color: "#a5b4fc" }}>{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.skillsSection.title}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.skillsSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.skills.map((skill, idx) => {
              const Icon = skillIcons[idx];
              const color = skillColors[idx];
              const num = String(idx + 1).padStart(2, "0");
              return (
                <div key={num}
                  className="relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="absolute top-0 right-0 text-7xl font-black select-none pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.03)", lineHeight: 1, transform: "translate(8px,-8px)" }}>
                    {num}
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{num} — {skill.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{skill.desc}</p>
                </div>
              );
            })}

            {/* 7th card spans full width on lg */}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.how.title}</h2>
            <p className="text-gray-400 text-lg">{t.how.subtitle}</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, #6366f1, #8b5cf6, transparent)" }} />
            {t.how.steps.map((item, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={idx} className="relative flex gap-6 mb-10 pl-14">
                <div className="absolute left-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", top: "0" }}>
                  {idx + 1}
                </div>
                <div className="flex-1 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-bold">{item.title}</h3>
                    <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>{item.time}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature callouts */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {t.features.map((f, idx) => {
            const Icon = featureIcons[idx];
            const color = featureColors[idx];
            return (
              <div key={idx} className="rounded-2xl p-8 text-center"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${color}20` }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            {t.cta.title}<br />{t.cta.title2}
          </h2>
          <p className="text-xl text-gray-400 mb-10">{t.cta.subtitle}</p>
          <button
            id="cta-launch-demo-btn"
            onClick={() => setPlannerOpen(true)}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-xl transition-all hover:scale-105 glow-btn"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", cursor: "pointer" }}>
            {t.cta.button}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Clock className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-white text-sm">O&apos;Clock AI</span>
        </div>
        <p className="text-xs text-gray-600">{t.footer.tagline}</p>
      </footer>

      <MeetingPlannerModal
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onStart={handleStartMeeting}
      />
    </div>
  );
}
