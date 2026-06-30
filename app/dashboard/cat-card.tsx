"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Droplets, Pill, FileText, Brain, AlertTriangle, QrCode } from "lucide-react";
import { QRCode } from "./qr-code";
import { PrivacySettings } from "./privacy-settings";
import { AIChat } from "./ai-chat";
import { HealthTimeline } from "./health-timeline";

interface CareLog { id: string; type: string; notes: string | null; completedAt: string | null; createdAt: string; }
interface Escalation { id: string; level: number; message: string; createdAt: string; }
interface Cat {
  id: string; pin: string; name: string; breed: string | null; color: string | null;
  age: number | null; gender: string | null; weight: number | null; photoUrl: string | null;
  allergies: string | null; isLost: boolean; lostAt: string | null;
  careLogs: CareLog[]; escalations: Escalation[];
}

const careLabels: Record<string, string> = { FEEDING: "Fed", WATER: "Water", MEDICATION: "Meds", VET_APPOINTMENT: "Vet", BEHAVIOUR_NOTE: "Note" };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface HealthResult { healthScore: number; confidence?: string; reasoning?: string; observations: string[]; warnings: string[]; recommendations: string[]; disclaimer: string; dataUsed?: { careLogsCount: number; vaccinationsCount: number; hasWeight: boolean; hasAge: boolean; }; }

export function CatCard({ cat }: { cat: Cat }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);
  const [flashType, setFlashType] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  async function toggleLost() {
    setToggling(true);
    await fetch(`/api/cats/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isLost: !cat.isLost }) });
    setToggling(false);
    router.refresh();
  }

  async function logCare(type: string, notes?: string) {
    setLogging(type);
    await fetch(`/api/cats/${cat.id}/care-log`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, notes: notes || null }) });
    setLogging(null);
    setFlashType(type);
    setTimeout(() => setFlashType(null), 600);
    setShowNote(false);
    setNoteText("");
    router.refresh();
  }

  async function runHealth() {
    setHealthLoading(true); setHealthResult(null);
    try {
      const res = await fetch(`/api/cats/${cat.id}/health-check`, { method: "POST" });
      if (res.ok) setHealthResult(await res.json());
      else { const err = await res.json(); setHealthResult({ healthScore: 0, observations: [err.error || "Failed"], warnings: [], recommendations: [], disclaimer: "" }); }
    } catch { setHealthResult({ healthScore: 0, observations: ["Network error"], warnings: [], recommendations: [], disclaimer: "" }); }
    setHealthLoading(false);
  }

  const scoreColor = healthResult ? (healthResult.healthScore >= 7 ? "#81B29A" : healthResult.healthScore >= 4 ? "#E07A5F" : "#C1432A") : "#E0D8D2";

  return (
    <div className={`card p-5 border-l-4 ${cat.isLost ? "border-[#C1432A]" : "border-[#81B29A]"}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[72px] w-[72px] rounded-full bg-[#F0E6DF] overflow-hidden flex-shrink-0 shadow-sm">
            {cat.photoUrl ? <img src={cat.photoUrl} alt={cat.name} className="h-full w-full object-cover" /> :
              <div className="h-full w-full flex items-center justify-center text-[#C4A99A] text-2xl font-display font-bold">{cat.name[0]}</div>}
          </div>
          <div>
            <h3 className="font-display font-bold text-[22px] text-[#2C1810] leading-tight">{cat.name}</h3>
            <p className="text-[12px] text-[#6B5B52] font-body mt-0.5">
              {[cat.breed, cat.gender, cat.weight ? `${cat.weight}kg` : null, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
        </div>
        {cat.isLost ? (
          <span className="inline-flex items-center gap-1.5 bg-[#FEF2F2] text-[#C1432A] text-[11px] font-semibold font-body px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1432A] animate-pulse" /> LOST
          </span>
        ) : (
          <span className="bg-[#EDF7F2] text-[#2D6A4F] text-[11px] font-semibold font-body px-2 py-1 rounded-full">Safe</span>
        )}
      </div>

      {/* Allergies alert */}
      {cat.allergies && (
        <div className="mt-3 flex items-center gap-1.5 px-3 py-2 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
          <AlertTriangle size={13} className="text-[#C1432A] flex-shrink-0" />
          <p className="text-[11px] text-[#C1432A] font-body">{cat.allergies}</p>
        </div>
      )}

      {/* PIN */}
      <div className="mt-3 p-3.5 bg-[#F8F4F1] rounded-[10px] text-center">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B5B52] font-body font-medium mb-0.5">PawPort PIN</p>
        <p className="font-body font-bold text-[26px] text-[#2C1810]" style={{ letterSpacing: "10px" }}>{cat.pin}</p>
      </div>

      {/* Divider */}
      <div className="mt-3.5 mb-3 border-t border-[#F0E6DF]" />

      {/* Care buttons — each with distinct color */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => logCare("FEEDING")} disabled={logging === "FEEDING"}
          className={`flex items-center gap-1 text-[12px] font-body font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.96] disabled:opacity-50 ${flashType === "FEEDING" ? "bg-[#D1FAE5]" : "bg-[#FFF4ED] text-[#B45A3C] hover:bg-[#FFE8D9]"}`}>
          <UtensilsCrossed size={13} /> {logging === "FEEDING" ? "..." : "Fed"}
        </button>
        <button onClick={() => logCare("WATER")} disabled={logging === "WATER"}
          className={`flex items-center gap-1 text-[12px] font-body font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.96] disabled:opacity-50 ${flashType === "WATER" ? "bg-[#D1FAE5]" : "bg-[#EDF4FF] text-[#3B6FA0] hover:bg-[#DCEEFF]"}`}>
          <Droplets size={13} /> {logging === "WATER" ? "..." : "Water"}
        </button>
        <button onClick={() => logCare("MEDICATION")} disabled={logging === "MEDICATION"}
          className={`flex items-center gap-1 text-[12px] font-body font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.96] disabled:opacity-50 ${flashType === "MEDICATION" ? "bg-[#D1FAE5]" : "bg-[#F5F0FF] text-[#6B4FA0] hover:bg-[#EDE5FF]"}`}>
          <Pill size={13} /> {logging === "MEDICATION" ? "..." : "Meds"}
        </button>
        <button onClick={() => setShowNote(!showNote)}
          className="flex items-center gap-1 text-[12px] font-body font-medium px-2.5 py-1.5 rounded-lg bg-[#F8F4F1] text-[#6B5B52] hover:bg-[#F0E6DF] transition-all duration-200 active:scale-[0.96]">
          <FileText size={13} /> Note
        </button>
      </div>

      {showNote && (
        <div className="mt-2 flex gap-2">
          <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Behaviour note..."
            className="flex-1 text-[12px] font-body border border-[#E0D8D2] rounded-lg px-2.5 py-2 bg-[#FDFBF7] focus:outline-none focus:border-[#E07A5F] transition-colors duration-200" />
          <button onClick={() => logCare("BEHAVIOUR_NOTE", noteText)} disabled={!noteText.trim()}
            className="text-[12px] font-body font-medium px-3 py-2 bg-[#2C1810] text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity duration-200 active:scale-[0.96]">Save</button>
        </div>
      )}

      {/* Recent logs */}
      {cat.careLogs.length > 0 && (
        <div className="mt-3 space-y-1">
          {cat.careLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-center justify-between text-[12px] font-body text-[#6B5B52]">
              <span className="text-[#2C1810]">{careLabels[log.type] || log.type}{log.notes ? ` — ${log.notes}` : ""}</span>
              <span className="text-[11px]">{timeAgo(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mt-3 mb-3 border-t border-[#F0E6DF]" />

      {/* AI Health Check */}
      <button onClick={runHealth} disabled={healthLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2C1810] text-white rounded-[10px] font-body font-semibold text-[13px] hover:bg-[#3D261C] disabled:opacity-50 transition-all duration-200 active:scale-[0.98]">
        <Brain size={15} /> {healthLoading ? "Analyzing..." : "AI Health Check"}
      </button>

      {healthResult && healthResult.healthScore > 0 && (
        <div className="mt-3 p-4 bg-[#F8F4F1] rounded-[12px]">
          {/* Score ring + confidence */}
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0E6DF" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${healthResult.healthScore * 10} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg" style={{ color: scoreColor }}>
                {healthResult.healthScore}
              </span>
            </div>
            <div>
              <p className="font-body font-semibold text-[13px] text-[#2C1810]">Health Score</p>
              {healthResult.confidence && (
                <p className="text-[11px] text-[#6B5B52] font-body">
                  Confidence: <span className={`font-medium ${healthResult.confidence === "high" ? "text-[#81B29A]" : healthResult.confidence === "medium" ? "text-[#E07A5F]" : "text-[#C1432A]"}`}>{healthResult.confidence}</span>
                </p>
              )}
            </div>
          </div>

          {/* AI Reasoning */}
          {healthResult.reasoning && (
            <p className="text-[11px] text-[#6B5B52] font-body italic mb-2 pb-2 border-b border-[#E0D8D2]">
              AI reasoning: {healthResult.reasoning.replace(/\*\*/g, "").replace(/\*/g, "")}
            </p>
          )}

          {/* Data used */}
          {healthResult.dataUsed && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#2D6A4F]">{healthResult.dataUsed.careLogsCount} care logs</span>
              <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#2D6A4F]">{healthResult.dataUsed.vaccinationsCount} vaccinations</span>
              {healthResult.dataUsed.hasWeight && <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#2D6A4F]">weight</span>}
              {healthResult.dataUsed.hasAge && <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#2D6A4F]">age</span>}
            </div>
          )}

          {/* Warnings */}
          {healthResult.warnings.length > 0 && (
            <div className="mb-2 space-y-1">
              {healthResult.warnings.map((w, i) => {
                const clean = typeof w === "string" ? w.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^\[?"?|"?\]?$/g, "").trim() : String(w);
                return clean ? <p key={i} className="text-[12px] text-[#C1432A] font-body font-medium flex items-start gap-1"><AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />{clean}</p> : null;
              })}
            </div>
          )}

          {/* Observations */}
          {healthResult.observations.length > 0 && (
            <div className="mb-2 space-y-0.5">
              {healthResult.observations.slice(0, 4).map((o, i) => {
                const clean = typeof o === "string" ? o.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^\[?"?|"?\]?$/g, "").trim() : String(o);
                return clean ? <p key={i} className="text-[12px] text-[#6B5B52] font-body pl-3 border-l-2 border-[#E0D8D2]">{clean}</p> : null;
              })}
            </div>
          )}

          {/* Recommendations */}
          {healthResult.recommendations.length > 0 && (
            <div className="space-y-0.5">
              {healthResult.recommendations.slice(0, 3).map((r, i) => {
                const clean = typeof r === "string" ? r.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^\[?"?|"?\]?$/g, "").trim() : String(r);
                return clean ? <p key={i} className="text-[12px] text-[#2C1810] font-body pl-3 border-l-2 border-[#E07A5F]">{clean}</p> : null;
              })}
            </div>
          )}

          {/* Disclaimer + Report */}
          <div className="mt-2 pt-2 border-t border-[#E0D8D2] flex items-start justify-between gap-2">
            <p className="text-[9px] text-[#6B5B52] font-body italic flex-1">{healthResult.disclaimer}</p>
            <button className="text-[9px] font-body text-[#C1432A] hover:underline flex-shrink-0">Report inaccurate</button>
          </div>
        </div>
      )}

      {/* QR + Actions row */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QRCode catId={cat.id} catName={cat.name} />
          <HealthTimeline catId={cat.id} catName={cat.name} />
        </div>
        <button onClick={toggleLost} disabled={toggling}
          className={`text-[12px] font-body font-medium px-3 py-1.5 rounded-[10px] transition-all duration-200 active:scale-[0.96] disabled:opacity-50 ${cat.isLost ? "bg-[#EDF7F2] text-[#2D6A4F] border border-[#81B29A]" : "bg-[#FEF2F2] text-[#C1432A] border border-[#FECACA]"}`}>
          {cat.isLost ? "Mark Found" : "Mark Lost"}
        </button>
      </div>

      {/* AI Chat */}
      <div className="mt-3">
        <AIChat catId={cat.id} catName={cat.name} />
      </div>

      {cat.isLost && <p className="mt-1.5 text-[10px] text-[#6B5B52] font-body">Temporal workflow active — alerts every 24h</p>}

      {/* Escalations */}
      {cat.escalations.length > 0 && (
        <div className="mt-3 p-2.5 bg-[#FEF2F2] rounded-lg space-y-1">
          {cat.escalations.slice(0, 3).map((esc) => (
            <p key={esc.id} className="text-[11px] font-body text-[#2C1810]">
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold mr-1.5 ${esc.level === 0 ? "bg-[#EDF7F2] text-[#2D6A4F]" : "bg-[#FEF2F2] text-[#C1432A] border border-[#FECACA]"}`}>{esc.level === 0 ? "ok" : esc.level}</span>
              {esc.message}
            </p>
          ))}
        </div>
      )}

      {/* Privacy */}
      <div className="mt-3 pt-2.5 border-t border-[#F0E6DF]">
        <PrivacySettings catId={cat.id} />
      </div>
    </div>
  );
}
