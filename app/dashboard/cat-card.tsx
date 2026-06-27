"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Droplets, Pill, FileText, Brain, MapPin, AlertTriangle } from "lucide-react";
import { QRCode } from "./qr-code";
import { PrivacySettings } from "./privacy-settings";

interface CareLog {
  id: string;
  type: string;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Escalation {
  id: string;
  level: number;
  message: string;
  createdAt: string;
}

interface Cat {
  id: string;
  pin: string;
  name: string;
  breed: string | null;
  color: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  photoUrl: string | null;
  allergies: string | null;
  isLost: boolean;
  lostAt: string | null;
  careLogs: CareLog[];
  escalations: Escalation[];
}

const careIcons: Record<string, typeof UtensilsCrossed> = {
  FEEDING: UtensilsCrossed,
  WATER: Droplets,
  MEDICATION: Pill,
  VET_APPOINTMENT: MapPin,
  BEHAVIOUR_NOTE: FileText,
};

const careLabels: Record<string, string> = {
  FEEDING: "Fed",
  WATER: "Water",
  MEDICATION: "Medication",
  VET_APPOINTMENT: "Vet Visit",
  BEHAVIOUR_NOTE: "Note",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface HealthResult {
  healthScore: number;
  observations: string[];
  warnings: string[];
  recommendations: string[];
  disclaimer: string;
}

export function CatCard({ cat }: { cat: Cat }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  async function toggleLostStatus() {
    setToggling(true);
    await fetch(`/api/cats/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLost: !cat.isLost }),
    });
    setToggling(false);
    router.refresh();
  }

  async function logCare(type: string, notes?: string) {
    setLogging(type);
    await fetch(`/api/cats/${cat.id}/care-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, notes: notes || null }),
    });
    setLogging(null);
    setShowNoteInput(false);
    setNoteText("");
    router.refresh();
  }

  async function runHealthCheck() {
    setHealthLoading(true);
    setHealthResult(null);
    try {
      const res = await fetch(`/api/cats/${cat.id}/health-check`, { method: "POST" });
      if (res.ok) {
        setHealthResult(await res.json());
      } else {
        const err = await res.json();
        setHealthResult({ healthScore: 0, observations: [err.error || "Failed"], warnings: [], recommendations: [], disclaimer: "" });
      }
    } catch {
      setHealthResult({ healthScore: 0, observations: ["Network error"], warnings: [], recommendations: [], disclaimer: "" });
    }
    setHealthLoading(false);
  }

  return (
    <div className={`card p-5 border-l-4 transition-all duration-200 ${cat.isLost ? "border-[#C1432A]" : "border-[#81B29A]"}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-[#F0E6DF] overflow-hidden flex-shrink-0">
            {cat.photoUrl ? (
              <img src={cat.photoUrl} alt={cat.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#C4A99A] text-sm font-body">No photo</div>
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-[#2C1810]">{cat.name}</h3>
            <p className="text-[13px] text-[#6B5B52] font-body">
              {[cat.breed, cat.gender, cat.weight ? `${cat.weight}kg` : null, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ") || "No details added"}
            </p>
          </div>
        </div>
        {cat.isLost ? (
          <span className="inline-flex items-center gap-1.5 bg-[#FEF2F2] text-[#C1432A] text-xs font-semibold font-body px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#C1432A] animate-pulse" />
            LOST
          </span>
        ) : (
          <span className="bg-[#EDF7F2] text-[#2D6A4F] text-xs font-semibold font-body px-2.5 py-1 rounded-full">
            Safe
          </span>
        )}
      </div>

      {/* Allergies */}
      {cat.allergies && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-[#FEF2F2] rounded-[10px] border border-[#FECACA]">
          <AlertTriangle size={14} className="text-[#C1432A] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#C1432A] font-body">Allergies: {cat.allergies}</p>
        </div>
      )}

      {/* PIN */}
      <div className="mt-4 p-4 bg-[#F8F4F1] rounded-[10px] text-center">
        <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body font-medium mb-1">PawPort PIN</p>
        <p className="font-body font-bold text-[28px] text-[#2C1810]" style={{ letterSpacing: "8px" }}>{cat.pin}</p>
      </div>

      {/* Quick Care Buttons */}
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body font-medium mb-2">Quick Log</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => logCare("FEEDING")} disabled={logging === "FEEDING"} className="flex items-center gap-1.5 text-[13px] font-body font-medium px-3 py-2 rounded-lg bg-[#F8F4F1] text-[#2C1810] hover:bg-[#F0E6DF] disabled:opacity-50 transition-colors duration-200">
            <UtensilsCrossed size={14} /> {logging === "FEEDING" ? "..." : "Fed Now"}
          </button>
          <button onClick={() => logCare("WATER")} disabled={logging === "WATER"} className="flex items-center gap-1.5 text-[13px] font-body font-medium px-3 py-2 rounded-lg bg-[#F8F4F1] text-[#2C1810] hover:bg-[#F0E6DF] disabled:opacity-50 transition-colors duration-200">
            <Droplets size={14} /> {logging === "WATER" ? "..." : "Water Now"}
          </button>
          <button onClick={() => logCare("MEDICATION")} disabled={logging === "MEDICATION"} className="flex items-center gap-1.5 text-[13px] font-body font-medium px-3 py-2 rounded-lg bg-[#F8F4F1] text-[#2C1810] hover:bg-[#F0E6DF] disabled:opacity-50 transition-colors duration-200">
            <Pill size={14} /> {logging === "MEDICATION" ? "..." : "Medication"}
          </button>
          <button onClick={() => setShowNoteInput(!showNoteInput)} className="flex items-center gap-1.5 text-[13px] font-body font-medium px-3 py-2 rounded-lg bg-[#F8F4F1] text-[#2C1810] hover:bg-[#F0E6DF] transition-colors duration-200">
            <FileText size={14} /> Note
          </button>
        </div>
        {showNoteInput && (
          <div className="mt-2 flex gap-2">
            <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Behaviour note..." className="flex-1 text-[13px] font-body border border-[#E0D8D2] rounded-lg px-3 py-2 bg-[#FDFBF7] focus:outline-none focus:border-[#E07A5F] transition-colors duration-200" />
            <button onClick={() => logCare("BEHAVIOUR_NOTE", noteText)} disabled={!noteText.trim()} className="text-[13px] font-body font-medium px-3 py-2 bg-[#2C1810] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity duration-200">Save</button>
          </div>
        )}
      </div>

      {/* Recent Care Logs */}
      {cat.careLogs.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body font-medium mb-2">Recent Care</p>
          <div className="space-y-1.5">
            {cat.careLogs.slice(0, 3).map((log) => {
              const Icon = careIcons[log.type] || FileText;
              return (
                <div key={log.id} className="flex items-center justify-between text-[13px] font-body">
                  <span className="flex items-center gap-2 text-[#2C1810]">
                    <Icon size={13} className="text-[#6B5B52]" />
                    {careLabels[log.type] || log.type}
                    {log.notes && <span className="text-[#6B5B52]">— {log.notes}</span>}
                  </span>
                  <span className="text-[13px] text-[#6B5B52]">{timeAgo(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Health Check */}
      <div className="mt-4">
        <button onClick={runHealthCheck} disabled={healthLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2C1810] text-white rounded-[10px] font-body font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity duration-200">
          <Brain size={16} />
          {healthLoading ? "Analyzing..." : "AI Health Check"}
        </button>

        {healthResult && healthResult.healthScore > 0 && (
          <div className="mt-3 p-4 bg-[#F8F4F1] rounded-[10px] text-[13px] font-body">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#2C1810]">Health Score</span>
              <span className={`font-bold text-xl ${healthResult.healthScore >= 7 ? "text-[#81B29A]" : healthResult.healthScore >= 4 ? "text-[#E07A5F]" : "text-[#C1432A]"}`}>
                {healthResult.healthScore}/10
              </span>
            </div>
            {healthResult.warnings.length > 0 && healthResult.warnings.map((w, i) => (
              <p key={i} className="text-[#C1432A] font-medium flex items-center gap-1"><AlertTriangle size={12} /> {w}</p>
            ))}
            {healthResult.observations.length > 0 && (
              <div className="mt-2">
                {healthResult.observations.map((o, i) => {
                  const cleaned = typeof o === "string" ? o.replace(/^\[?"?|"?\]?$/g, "").replace(/^["']|["']$/g, "").trim() : String(o);
                  if (!cleaned) return null;
                  return <p key={i} className="text-[#6B5B52]">&bull; {cleaned}</p>;
                })}
              </div>
            )}
            {healthResult.recommendations.length > 0 && (
              <div className="mt-2">
                {healthResult.recommendations.map((r, i) => {
                  const cleaned = typeof r === "string" ? r.replace(/^\[?"?|"?\]?$/g, "").replace(/^["']|["']$/g, "").trim() : String(r);
                  if (!cleaned) return null;
                  return <p key={i} className="text-[#2C1810]">&bull; {cleaned}</p>;
                })}
              </div>
            )}
            {healthResult.disclaimer && <p className="mt-2 text-[11px] text-[#6B5B52] border-t border-[#E0D8D2] pt-2">{healthResult.disclaimer}</p>}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="mt-3">
        <QRCode catId={cat.id} catName={cat.name} />
      </div>

      {/* Escalations */}
      {cat.escalations.length > 0 && (
        <div className="mt-3 p-3 bg-[#FEF2F2] rounded-[10px] border border-[#FECACA]">
          <p className="text-[11px] uppercase tracking-widest text-[#C1432A] font-body font-medium mb-2">Alert History</p>
          <div className="space-y-1.5">
            {cat.escalations.map((esc) => (
              <div key={esc.id} className="text-[13px] font-body text-[#2C1810]">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-2 ${esc.level === 0 ? "bg-[#EDF7F2] text-[#2D6A4F]" : "bg-[#FEF2F2] text-[#C1432A]"}`}>
                  {esc.level === 0 ? "ok" : esc.level}
                </span>
                {esc.message}
                <span className="text-[#6B5B52] ml-2 text-[11px]">{new Date(esc.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <button onClick={toggleLostStatus} disabled={toggling} className={`text-sm font-body font-medium px-4 py-2 rounded-[10px] transition-all duration-200 disabled:opacity-50 ${cat.isLost ? "bg-[#EDF7F2] text-[#2D6A4F] border border-[#81B29A]" : "bg-[#FEF2F2] text-[#C1432A] border border-[#FECACA]"}`}>
          {cat.isLost ? "Mark as Found" : "Mark as Lost"}
        </button>
      </div>

      {cat.isLost && (
        <p className="mt-2 text-[11px] text-[#6B5B52] font-body">
          Temporal workflow active — escalating alerts every 24 hours
        </p>
      )}

      {/* Privacy Settings */}
      <div className="mt-3 pt-3 border-t border-[#F0E6DF]">
        <PrivacySettings catId={cat.id} />
      </div>
    </div>
  );
}
