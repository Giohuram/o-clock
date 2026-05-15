"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Target,
  Users,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Mic,
} from "lucide-react";

/* ── types ── */
export interface Participant {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface MeetingData {
  title: string;
  date: string;
  time: string;
  location: string;
  objective: string;
  agenda: string;
  participants: Participant[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: (data: MeetingData) => void;
}

const STEPS = [
  { label: "Réunion", icon: Clock },
  { label: "Logistique", icon: Calendar },
  { label: "Objectif", icon: Target },
  { label: "Participants", icon: Users },
];

const empty = (): MeetingData => ({
  title: "",
  date: "",
  time: "",
  location: "",
  objective: "",
  agenda: "",
  participants: [{ id: crypto.randomUUID(), name: "", role: "", email: "" }],
});

export default function MeetingPlannerModal({ open, onClose, onStart }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<MeetingData>(empty());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  /* reset on open */
  useEffect(() => {
    if (open) {
      setStep(0);
      setData(empty());
      setErrors({});
      setConfirmed(false);
    }
  }, [open]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  /* ── helpers ── */
  const set = (field: keyof MeetingData, value: string) =>
    setData((d) => ({ ...d, [field]: value }));

  const setParticipant = (id: string, field: keyof Participant, value: string) =>
    setData((d) => ({
      ...d,
      participants: d.participants.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));

  const addParticipant = () =>
    setData((d) => ({
      ...d,
      participants: [
        ...d.participants,
        { id: crypto.randomUUID(), name: "", role: "", email: "" },
      ],
    }));

  const removeParticipant = (id: string) =>
    setData((d) => ({
      ...d,
      participants: d.participants.filter((p) => p.id !== id),
    }));

  /* ── validation per step ── */
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !data.title.trim()) e.title = "Le titre est requis";
    if (step === 1) {
      if (!data.date) e.date = "La date est requise";
      if (!data.time) e.time = "L'heure est requise";
      if (!data.location.trim()) e.location = "Le lieu est requis";
    }
    if (step === 2 && !data.objective.trim()) e.objective = "L'objectif est requis";
    if (step === 3) {
      data.participants.forEach((p, i) => {
        if (!p.name.trim()) e[`name-${i}`] = "Nom requis";
        if (!p.email.trim()) e[`email-${i}`] = "Email requis";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => s + 1); };
  const prev = () => { setErrors({}); setStep((s) => s - 1); };

  const handleConfirm = () => {
    if (!validate()) return;
    setConfirmed(true);
    setTimeout(() => {
      onStart(data);
      onClose();
    }, 1600);
  };

  /* ── shared input style ── */
  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-600 ${
      err
        ? "border border-red-500/60 bg-red-500/5 focus:border-red-400"
        : "border border-white/8 bg-white/4 focus:border-indigo-500/60 focus:bg-white/6"
    }`;

  const progress = ((step + 1) / STEPS.length) * 100;

  /* ── confirmed screen ── */
  if (confirmed) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
          <div style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 0 40px rgba(99,102,241,0.5)",
              animation: "pulse-glow 1.5s ease-in-out infinite",
            }}>
              <CheckCircle2 size={36} color="white" />
            </div>
            <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Réunion enregistrée !
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              Démarrage de l&apos;enregistrement…
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: 8, justifyContent: "center" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#6366f1",
                  animation: `bounce-dot 0.8s ${i * 0.2}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <p style={{ color: "#a5b4fc", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Planifier une réunion
            </p>
            <h2 style={{ color: "white", fontSize: "1.25rem", fontWeight: 800 }}>
              {STEPS[step].icon && (() => { const Icon = STEPS[step].icon; return <Icon size={16} style={{ display: "inline", marginRight: 8, color: "#a5b4fc", verticalAlign: "middle" }} />; })()}
              {STEPS[step].label}
            </h2>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ padding: "0 1.5rem", marginBottom: "0.25rem" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < step ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : i === step ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                    border: i === step ? "2px solid #6366f1" : "2px solid transparent",
                    transition: "all 0.3s",
                  }}>
                    {i < step
                      ? <CheckCircle2 size={14} color="white" />
                      : <Icon size={14} color={i === step ? "#a5b4fc" : "#4b5563"} />
                    }
                  </div>
                  <span style={{ fontSize: "0.65rem", color: i <= step ? "#a5b4fc" : "#4b5563", fontWeight: i === step ? 700 : 400 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              borderRadius: 4, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {/* Step 0 — Titre */}
          {step === 0 && (
            <div className="step-anim">
              <label className="form-label">Titre de la réunion *</label>
              <input
                id="meeting-title"
                className={inputCls(errors.title)}
                placeholder="Ex : Revue stratégique Q3 2026"
                value={data.title}
                onChange={(e) => set("title", e.target.value)}
                autoFocus
              />
              {errors.title && <p className="form-error">{errors.title}</p>}

              <div style={{ height: "1.5rem" }} />
              <div className="info-banner">
                <Mic size={16} color="#a5b4fc" />
                <span>Après validation, O&apos;Clock AI enregistrera et analysera automatiquement votre réunion.</span>
              </div>
            </div>
          )}

          {/* Step 1 — Date / Heure / Lieu */}
          {step === 1 && (
            <div className="step-anim">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="form-label">
                    <Calendar size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                    Date *
                  </label>
                  <input
                    id="meeting-date"
                    type="date"
                    className={inputCls(errors.date)}
                    value={data.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>
                <div>
                  <label className="form-label">
                    <Clock size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                    Heure *
                  </label>
                  <input
                    id="meeting-time"
                    type="time"
                    className={inputCls(errors.time)}
                    value={data.time}
                    onChange={(e) => set("time", e.target.value)}
                  />
                  {errors.time && <p className="form-error">{errors.time}</p>}
                </div>
              </div>

              <label className="form-label">
                <MapPin size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Lieu / Lien de la réunion *
              </label>
              <input
                id="meeting-location"
                className={inputCls(errors.location)}
                placeholder="Ex : Salle Picasso, Paris — ou https://meet.google.com/..."
                value={data.location}
                onChange={(e) => set("location", e.target.value)}
              />
              {errors.location && <p className="form-error">{errors.location}</p>}
            </div>
          )}

          {/* Step 2 — Objectif / Agenda */}
          {step === 2 && (
            <div className="step-anim">
              <label className="form-label">
                <Target size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Objectif de la réunion *
              </label>
              <input
                id="meeting-objective"
                className={inputCls(errors.objective)}
                placeholder="Ex : Valider le budget Q3 et définir les priorités équipe"
                value={data.objective}
                onChange={(e) => set("objective", e.target.value)}
              />
              {errors.objective && <p className="form-error">{errors.objective}</p>}

              <div style={{ height: 16 }} />

              <label className="form-label">Agenda (optionnel)</label>
              <textarea
                id="meeting-agenda"
                className={inputCls()}
                rows={5}
                placeholder={`1. Intro & tour de table — 5 min\n2. Présentation résultats Q2 — 15 min\n3. Discussion & décisions — 20 min\n4. Actions & next steps — 10 min`}
                value={data.agenda}
                onChange={(e) => set("agenda", e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          )}

          {/* Step 3 — Participants */}
          {step === 3 && (
            <div className="step-anim">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Participants *</label>
                <button onClick={addParticipant} className="add-participant-btn">
                  <Plus size={13} />
                  Ajouter
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                {data.participants.map((p, idx) => (
                  <div key={p.id} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 700 }}>Participant {idx + 1}</span>
                      {data.participants.length > 1 && (
                        <button onClick={() => removeParticipant(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <input
                          className={inputCls(errors[`name-${idx}`])}
                          placeholder="Nom complet"
                          value={p.name}
                          onChange={(e) => setParticipant(p.id, "name", e.target.value)}
                        />
                        {errors[`name-${idx}`] && <p className="form-error">{errors[`name-${idx}`]}</p>}
                      </div>
                      <div>
                        <input
                          className={inputCls()}
                          placeholder="Rôle / Titre"
                          value={p.role}
                          onChange={(e) => setParticipant(p.id, "role", e.target.value)}
                        />
                      </div>
                    </div>
                    <input
                      className={inputCls(errors[`email-${idx}`])}
                      placeholder="adresse@email.com"
                      type="email"
                      value={p.email}
                      onChange={(e) => setParticipant(p.id, "email", e.target.value)}
                    />
                    {errors[`email-${idx}`] && <p className="form-error">{errors[`email-${idx}`]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer nav ── */}
        <div className="modal-footer">
          <button
            onClick={step === 0 ? onClose : prev}
            className="modal-btn-secondary"
          >
            {step === 0 ? "Annuler" : (
              <><ChevronLeft size={16} style={{ display: "inline", marginRight: 4 }} />Retour</>
            )}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="modal-btn-primary">
              Suivant <ChevronRight size={16} style={{ display: "inline", marginLeft: 4 }} />
            </button>
          ) : (
            <button onClick={handleConfirm} className="modal-btn-primary" style={{ gap: 8, display: "flex", alignItems: "center" }}>
              <Mic size={15} />
              Lancer l&apos;enregistrement
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          width: 100%; max-width: 540px;
          background: #0f1117;
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          box-shadow: 0 0 60px rgba(99,102,241,0.15), 0 25px 60px rgba(0,0,0,0.6);
          display: flex; flex-direction: column;
          max-height: 90vh;
          animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .modal-close-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #9ca3af;
          cursor: pointer; padding: 6px;
          transition: all 0.2s; display: flex; align-items: center;
        }
        .modal-close-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .modal-body {
          flex: 1; overflow-y: auto;
          padding: 1.25rem 1.5rem;
        }
        .modal-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
        }
        .form-label {
          display: block;
          font-size: 0.78rem; font-weight: 600;
          color: #9ca3af; letter-spacing: 0.04em;
          margin-bottom: 6px; text-transform: uppercase;
        }
        .form-error {
          color: #f87171; font-size: 0.72rem; margin-top: 4px;
        }
        .modal-btn-primary {
          padding: 10px 22px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-weight: 700; font-size: 0.875rem;
          border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex; align-items: center;
        }
        .modal-btn-primary:hover { opacity: 0.88; transform: scale(1.02); }
        .modal-btn-secondary {
          padding: 10px 18px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af; font-weight: 600; font-size: 0.875rem;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-btn-secondary:hover { background: rgba(255,255,255,0.09); color: white; }
        .add-participant-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .add-participant-btn:hover { background: rgba(99,102,241,0.25); }
        .info-banner {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 12px; padding: 12px 14px;
          color: #a5b4fc; font-size: 0.8rem; line-height: 1.5;
        }
        .step-anim { animation: fadeInUp 0.25s ease both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
        }
      `}</style>
    </div>
  );
}
