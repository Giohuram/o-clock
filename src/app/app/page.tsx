"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Clock,
  ArrowLeft,
  Send,
  Loader2,
  Copy,
  Check,
  Download,
  Bell,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Key,
  Mic,
  Square,
  Share2,
  ListTodo,
  Info,
} from "lucide-react";
import { type MeetingData } from "@/components/MeetingPlannerModal";

const DEMO_TRANSCRIPT = `Meeting: Q2 Product Roadmap Review
Date: Today
Participants: Sarah Chen (Product Manager), James Okafor (CTO), Maria Rossi (Head of Design), Tom Brennan (Engineering Lead)

Sarah: Alright, let's get started. We need to finalize the Q2 roadmap today. James, what's the status on the API migration?

James: We're about 60% done. The main blocker is the authentication layer — Tom's team needs 2 more weeks to complete it.

Tom: Confirmed. I'll have the auth module ready by the 24th. After that, we can push to staging and run full QA.

Sarah: OK so we're making a decision: API migration goes live end of Q2, no exceptions. James, you own that deadline.

James: Agreed. I'll also need Maria to finalize the new onboarding screens so we can integrate them before launch.

Maria: I can have the Figma prototypes ready by Friday. But I need feedback from Tom by Tuesday to finalize the mobile breakpoints.

Tom: I'll review and send feedback by Monday end of day.

Sarah: Perfect. Also — we need to decide on the pricing page redesign. Maria, can you add that to the sprint?

Maria: Yes, I'll slot it in for next week. Should be done in 3 days.

Sarah: Great. One open question: do we want to soft-launch to enterprise clients only, or open to all? James, can you prepare a risk assessment for both options?

James: I'll have that ready by Thursday.

Sarah: Let's plan a follow-up meeting next Tuesday at 10am to review. Agenda: API staging results, pricing page preview, and the enterprise launch decision.`;

interface Notification {
  name: string;
  email: string;
  tasks: string[];
  sent: boolean;
}

interface Task {
  id: string;
  description: string;
  owner: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

export default function AppPage() {
  const { t } = useLang();
  const [transcript, setTranscript] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(true);
  const [step, setStep] = useState<"input" | "processing" | "done">("input");
  const [processingMsg, setProcessingMsg] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const loadDemo = () => setTranscript(DEMO_TRANSCRIPT);

  // Load saved tasks and meeting data on mount
  useEffect(() => {
    const saved = localStorage.getItem("oclock-tasks");
    if (saved) {
      try {
        setSavedTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }

    const meeting = sessionStorage.getItem("oclock_meeting");
    if (meeting) {
      try {
        const parsed = JSON.parse(meeting) as MeetingData;
        setMeetingData(parsed);
        // Pre-fill transcript with meeting header
        const header = `Meeting: ${parsed.title}\nDate: ${parsed.date} at ${parsed.time}\nLocation: ${parsed.location}\nObjective: ${parsed.objective}\nParticipants: ${parsed.participants.map(p => `${p.name}${p.role ? ` (${p.role})` : ""}`).join(", ")}\n\n`;
        setTranscript(header);
      } catch (e) {
        console.error("Failed to load meeting data", e);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("oclock-tasks", JSON.stringify(savedTasks));
  }, [savedTasks]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
      setError("");
    } catch (err) {
      setError(t.app.micError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        transcribeAudio();
      };
      setRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setTranscribing(true);
    setProcessingMsg("Transcribing audio...");

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Transcription failed");
      }

      const data = await res.json();
      setTranscript((prev) => prev + (prev ? "\n\n" : "") + data.transcript);
      setError("");
    } catch (err) {
      setError(t.app.transcribeError);
    } finally {
      setTranscribing(false);
      audioChunksRef.current = [];
    }
  };

  const extractTasks = (reportText: string): Task[] => {
    const tasks: Task[] = [];
    const lines = reportText.split("\n");
    let inActionItems = false;

    for (const line of lines) {
      if (line.includes("## Action Items")) {
        inActionItems = true;
        continue;
      }
      if (inActionItems && line.startsWith("## ")) {
        inActionItems = false;
      }
      if (inActionItems && line.startsWith("|") && !line.includes("Task") && !line.includes("---")) {
        const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
        if (cols.length >= 4) {
          const task = cols[1];
          const owner = cols[2];
          const deadline = cols[3];
          if (task && owner && owner !== "Owner" && task !== "Task") {
            tasks.push({
              id: `${Date.now()}-${Math.random()}`,
              description: task,
              owner,
              deadline,
              status: "pending",
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return tasks;
  };

  const extractNotifications = (reportText: string): Notification[] => {
    const notifs: Notification[] = [];
    const lines = reportText.split("\n");
    let inActionItems = false;
    const taskMap: Record<string, string[]> = {};

    for (const line of lines) {
      if (line.includes("## Action Items")) { inActionItems = true; continue; }
      if (inActionItems && line.startsWith("## ")) { inActionItems = false; }
      if (inActionItems && line.startsWith("|") && !line.includes("Task") && !line.includes("---")) {
        const cols = line.split("|").map(c => c.trim()).filter(Boolean);
        if (cols.length >= 3) {
          const task = cols[1];
          const owner = cols[2];
          if (owner && owner !== "Owner" && task && task !== "Task") {
            if (!taskMap[owner]) taskMap[owner] = [];
            taskMap[owner].push(task);
          }
        }
      }
    }

    Object.entries(taskMap).forEach(([name, tasks]) => {
      const firstName = name.split(" ")[0];
      notifs.push({
        name: firstName,
        email: `${firstName.toLowerCase()}@company.com`,
        tasks,
        sent: false,
      });
    });

    return notifs;
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    setError("");
    setReport("");
    setNotifications([]);
    setLoading(true);
    setStep("processing");

    const steps = t.app.processingSteps as readonly string[];

    let i = 0;
    setProcessingMsg(steps[0]);
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setProcessingMsg(steps[i]);
    }, 1200);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, apiKey }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStep("input");
      } else {
        setReport(data.report);
        const notifs = extractNotifications(data.report);
        const tasks = extractTasks(data.report);
        setSavedTasks((prev) => [...prev, ...tasks]);
        setTimeout(() => {
          setNotifications(notifs.map(n => ({ ...n, sent: true })));
          setStep("done");
          setShowNotifs(true);
          setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }, 600);
      }
    } catch {
      clearInterval(interval);
      setError(t.app.networkError);
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oclock-ai-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0b0f" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-50"
        style={{ background: "rgba(10,11,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t.app.back}</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white">O&apos;Clock AI</span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-1 font-medium" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>{t.app.liveDemoTag}</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <LanguageSwitcher />
          <Link href="/knowledge-base" className="hidden sm:block text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
            {t.app.knowledgeBase}
          </Link>
          <Link href="/analytics" className="hidden sm:block text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
            {t.app.analytics}
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{t.app.pageTitle}</h1>
          <p className="text-gray-400">{t.app.pageSubtitle}</p>
        </div>

        {/* Planned Meeting Info */}
        {meetingData && (
          <div className="mb-8 rounded-2xl p-6 relative overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">Session Active</span>
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Enregistrement prêt
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{meetingData.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 mt-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Clock size={16} className="text-indigo-400" />
                  <span>{meetingData.date} à {meetingData.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Info size={16} className="text-indigo-400" />
                  <span>{meetingData.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300 col-span-full">
                  <div className="font-bold text-indigo-300 shrink-0">Objectif:</div>
                  <span className="italic">"{meetingData.objective}"</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300 col-span-full mt-1">
                  <div className="font-bold text-indigo-300 shrink-0 mt-1">Participants:</div>
                  <div className="flex flex-wrap gap-2">
                    {meetingData.participants.map(p => (
                      <span key={p.id} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
                        {p.name} <span className="text-gray-500">({p.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording section */}
        <div className="mb-6 flex justify-center gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={transcribing}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <Mic className="w-4 h-4" />
              {t.app.startRecording}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 animate-pulse"
              style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.5)" }}>
              <Square className="w-4 h-4" />
              {t.app.stopRecording}
            </button>
          )}
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <ListTodo className="w-4 h-4" />
            {t.app.tasks} ({savedTasks.length})
          </button>
        </div>

        {/* Tasks panel */}
        {showTasks && savedTasks.length > 0 && (
          <div className="mb-6 rounded-2xl p-5" style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
            <h3 className="font-bold text-white mb-4">{t.app.savedTasks}</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {savedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={(e) => {
                      setSavedTasks(savedTasks.map(tk => tk.id === task.id ? { ...tk, status: e.target.checked ? "completed" : "pending" } : tk));
                    }}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${task.status === "completed" ? "text-gray-500 line-through" : "text-white"}`}>{task.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.app.assignedTo}: {task.owner} • {t.app.due}: {task.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Key toggle */}
        <div className="mb-4">
          <button onClick={() => setShowApiKey(!showApiKey)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors hover:text-white text-gray-400"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <Key className="w-3.5 h-3.5" />
            {showApiKey ? t.app.apiKeyHide : t.app.apiKeySet} {t.app.apiKeyLabel}
            {showApiKey ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showApiKey && (
            <div className="mt-3">
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full md:w-96 px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)", color: "#e8eaf0" }}
              />
              <p className="text-xs text-gray-600 mt-1.5">{t.app.apiKeyNote}</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm text-gray-400 font-medium">{t.app.transcriptLabel}</span>
            <button onClick={loadDemo}
              className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:opacity-80"
              style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
              {t.app.loadDemo}
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={t.app.transcriptPlaceholder}
            rows={14}
            className="w-full px-4 py-4 text-sm resize-none outline-none"
            style={{ background: "transparent", color: "#c9cdd9", lineHeight: "1.7" }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Generate button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleGenerate}
            disabled={loading || !transcript.trim()}
            className="flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{processingMsg}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t.app.generateReport}
              </>
            )}
          </button>
        </div>

        {/* Output section */}
        {step === "done" && report && (
          <div ref={reportRef} className="space-y-6 animate-fade-up">

            {/* Notifications panel */}
            {notifications.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" style={{ color: "#a5b4fc" }} />
                    <span className="font-bold text-white">{t.app.notificationsSent}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(34,197,94,0.2)", color: "#86efac" }}>
                      {notifications.length} {t.app.recipients}
                    </span>
                  </div>
                  {showNotifs ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showNotifs && (
                  <div className="px-5 pb-5 space-y-3">
                    {notifications.map((n) => (
                      <div key={n.name} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-white text-sm">Hi {n.name},</span>
                            <span className="text-gray-500 text-xs ml-2">{n.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#86efac" }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.app.sentImmediately}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{t.app.meetingResponsible}</p>
                        {n.tasks.map((taskItem, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-300 mb-1">
                            <span style={{ color: "#a5b4fc" }}>→</span>
                            <span>{taskItem}</span>
                          </div>
                        ))}
                        <p className="text-xs mt-3 pt-3" style={{ color: "#6b7280", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          {t.app.autoReminder} — <em>O&apos;Clock AI</em>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Report */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#86efac" }} />
                    <span className="text-sm font-bold text-white">{t.app.meetingReport}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const text = `Check out this O'Clock AI Meeting Report:\n\n${report}`;
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-md transition-colors hover:opacity-80 font-medium"
                      style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                      <Share2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span className="hidden xs:inline">{t.app.share}</span>
                    </button>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-md transition-colors hover:opacity-80 font-medium"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#c9cdd9" }}>
                      {copied ? <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                      <span className="hidden xs:inline">{copied ? t.app.copied : t.app.copy}</span>
                    </button>
                    <button onClick={handleDownload}
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-md transition-colors hover:opacity-80 font-medium"
                      style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                      <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      .md
                    </button>
                  </div>
                </div>
              <div className="px-6 py-6 prose-dark overflow-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {report}
                </ReactMarkdown>
              </div>
            </div>

            {/* 72h tracker */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "#fbbf24" }} />
                {t.app.tracker72h}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
{(() => {
                  const icons = ["✓", "⏰", "⚠️", "🚨"];
                  const colors = ["#86efac", "#fbbf24", "#f87171", "#f87171"];
                  return t.app.trackerSteps.map((step, idx) => (
                    <div key={idx} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="text-lg mb-1">{icons[idx]}</div>
                      <div className="font-bold text-sm" style={{ color: colors[idx] }}>{step.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Reset */}
            <div className="text-center pt-2">
              <button onClick={() => { setStep("input"); setReport(""); setNotifications([]); setTranscript(""); }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4">
                {t.app.processAnother}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
