"use client";

import { useState } from "react";
import { X, Plus, Trash2, Users, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export interface Participant {
  name: string;
  email: string;
  role: string;
  access: "full" | "readonly" | "actionItems";
}

export interface MeetingSetup {
  meetingName: string;
  participants: Participant[];
}

interface Props {
  onStart: (setup: MeetingSetup) => void;
  onSkip: () => void;
}

const EMPTY_PARTICIPANT: Participant = { name: "", email: "", role: "", access: "full" };

export default function MeetingSetupModal({ onStart, onSkip }: Props) {
  const { t } = useLang();
  const [meetingName, setMeetingName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([{ ...EMPTY_PARTICIPANT }]);

  const addParticipant = () => setParticipants([...participants, { ...EMPTY_PARTICIPANT }]);

  const removeParticipant = (idx: number) =>
    setParticipants(participants.filter((_, i) => i !== idx));

  const updateParticipant = (idx: number, field: keyof Participant, value: string) => {
    setParticipants(participants.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    ));
  };

  const handleStart = () => {
    const filledParticipants = participants.filter(p => p.name.trim() || p.email.trim());
    onStart({ meetingName: meetingName.trim(), participants: filledParticipants });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0e0f14", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-5 z-10"
          style={{ background: "#0e0f14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">{t.meetingSetup.title}</h2>
              <p className="text-gray-500 text-xs">{t.meetingSetup.subtitle}</p>
            </div>
          </div>
          <button onClick={onSkip} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Meeting name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.meetingSetup.meetingNameLabel}
            </label>
            <input
              type="text"
              value={meetingName}
              onChange={e => setMeetingName(e.target.value)}
              placeholder={t.meetingSetup.meetingNamePlaceholder}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)", color: "#e8eaf0" }}
            />
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                {t.meetingSetup.addParticipant} ({participants.length})
              </label>
            </div>

            <div className="space-y-3">
              {participants.map((p, idx) => (
                <div key={idx} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.meetingSetup.participantName}</label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={e => updateParticipant(idx, "name", e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8eaf0" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.meetingSetup.participantEmail}</label>
                      <input
                        type="email"
                        value={p.email}
                        onChange={e => updateParticipant(idx, "email", e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8eaf0" }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">{t.meetingSetup.participantRole}</label>
                      <input
                        type="text"
                        value={p.role}
                        onChange={e => updateParticipant(idx, "role", e.target.value)}
                        placeholder="Product Manager"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8eaf0" }}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">{t.meetingSetup.participantAccess}</label>
                      <select
                        value={p.access}
                        onChange={e => updateParticipant(idx, "access", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8eaf0" }}>
                        <option value="full" style={{ background: "#1a1b22" }}>{t.meetingSetup.accessLevels.full}</option>
                        <option value="readonly" style={{ background: "#1a1b22" }}>{t.meetingSetup.accessLevels.readonly}</option>
                        <option value="actionItems" style={{ background: "#1a1b22" }}>{t.meetingSetup.accessLevels.actionItems}</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      {participants.length > 1 && (
                        <button onClick={() => removeParticipant(idx)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-2 rounded-lg hover:bg-red-500/10">
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.meetingSetup.removeParticipant}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addParticipant}
              className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl w-full justify-center transition-all hover:opacity-80"
              style={{ border: "1px dashed rgba(99,102,241,0.4)", color: "#a5b4fc", background: "rgba(99,102,241,0.05)" }}>
              <Plus className="w-4 h-4" />
              {t.meetingSetup.addParticipant}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 gap-3"
          style={{ background: "#0e0f14", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4">
            {t.meetingSetup.skip}
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {t.meetingSetup.startMeeting}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
