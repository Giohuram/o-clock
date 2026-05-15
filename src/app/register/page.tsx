"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, EyeOff, ArrowRight, AlertCircle, Check } from "lucide-react";
import { useAuth, UserRole } from "@/lib/AuthContext";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ROLES: { value: UserRole; icon: string }[] = [
  { value: "admin", icon: "👑" },
  { value: "manager", icon: "📊" },
  { value: "participant", icon: "👤" },
  { value: "guest", icon: "👁️" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", role: "participant" as UserRole });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) {
      router.push("/app");
    } else {
      setError(result.error ?? "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0b0f" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">O&apos;Clock AI</span>
        </Link>
        <LanguageSwitcher />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">{t.auth.registerTitle}</h1>
            <p className="text-gray-400 text-sm">{t.auth.registerSubtitle}</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

            {/* SSO */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 transition-all hover:text-white hover:scale-105"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 transition-all hover:text-white hover:scale-105"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                <span className="font-bold text-blue-400 text-xs">MS</span>
                Microsoft
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-gray-500" style={{ background: "#0a0b0f" }}>{t.auth.orContinue}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.auth.nameLabel}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)", color: "#e8eaf0" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.auth.companyLabel}</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)", color: "#e8eaf0" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.auth.emailLabel}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)", color: "#e8eaf0" }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.auth.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)", color: "#e8eaf0" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">{t.auth.roleLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(({ value, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all"
                      style={{
                        background: form.role === value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${form.role === value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: form.role === value ? "#a5b4fc" : "#9ca3af",
                      }}>
                      <span>{icon}</span>
                      <span className="flex-1 text-xs font-medium">{t.auth.roles[value]}</span>
                      {form.role === value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t.auth.signUp}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center">{t.auth.terms}</p>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-semibold hover:text-white transition-colors" style={{ color: "#a5b4fc" }}>
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
