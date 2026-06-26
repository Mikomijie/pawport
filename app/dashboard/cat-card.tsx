"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCode } from "./qr-code";

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

const careTypeIcons: Record<string, string> = {
  FEEDING: "🍽️",
  WATER: "💧",
  MEDICATION: "💊",
  VET_APPOINTMENT: "🏥",
  BEHAVIOUR_NOTE: "📝",
};

const careTypeLabels: Record<string, string> = {
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
        const data = await res.json();
        setHealthResult(data);
      } else {
        const err = await res.json();
        setHealthResult({
          healthScore: 0,
          observations: [err.error || "Failed to get health assessment"],
          warnings: [],
          recommendations: [],
          disclaimer: "",
        });
      }
    } catch {
      setHealthResult({
        healthScore: 0,
        observations: ["Network error. Please try again."],
        warnings: [],
        recommendations: [],
        disclaimer: "",
      });
    }
    setHealthLoading(false);
  }

  return (
    <div className={`rounded-lg bg-white shadow-md p-5 border-l-4 ${cat.isLost ? "border-red-500" : "border-green-500"}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {cat.photoUrl ? (
              <img src={cat.photoUrl} alt={cat.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl">🐱</div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{cat.name}</h3>
            <p className="text-sm text-gray-500">
              {[cat.breed, cat.gender, cat.weight ? `${cat.weight}kg` : null, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {cat.isLost ? "LOST" : "Safe"}
        </span>
      </div>

      {/* Allergies alert */}
      {cat.allergies && (
        <div className="mt-2 px-2 py-1 bg-red-50 border border-red-100 rounded text-xs text-red-700">
          ⚠️ Allergies: {cat.allergies}
        </div>
      )}

      {/* PIN */}
      <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-center border border-indigo-100">
        <p className="text-xs text-indigo-600 font-medium mb-1">PawPort PIN</p>
        <p className="text-2xl font-mono font-bold text-indigo-900 tracking-[0.3em]">{cat.pin}</p>
        <p className="text-xs text-indigo-500 mt-1">Write this on your cat&apos;s collar tag</p>
      </div>

      {/* Quick Care Buttons */}
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Log:</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => logCare("FEEDING")}
            disabled={logging === "FEEDING"}
            className="text-xs px-2.5 py-1.5 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors"
          >
            {logging === "FEEDING" ? "..." : "🍽️ Fed Now"}
          </button>
          <button
            onClick={() => logCare("WATER")}
            disabled={logging === "WATER"}
            className="text-xs px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {logging === "WATER" ? "..." : "💧 Water Now"}
          </button>
          <button
            onClick={() => logCare("MEDICATION")}
            disabled={logging === "MEDICATION"}
            className="text-xs px-2.5 py-1.5 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
          >
            {logging === "MEDICATION" ? "..." : "💊 Medication"}
          </button>
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="text-xs px-2.5 py-1.5 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            📝 Note
          </button>
        </div>

        {showNoteInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Behaviour note..."
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => logCare("BEHAVIOUR_NOTE", noteText)}
              disabled={!noteText.trim() || logging === "BEHAVIOUR_NOTE"}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Recent Care Logs */}
      {cat.careLogs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Recent care:</p>
          <div className="space-y-1">
            {cat.careLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="text-xs text-gray-600 flex items-center justify-between">
                <span>
                  {careTypeIcons[log.type] || "📋"} {careTypeLabels[log.type] || log.type}
                  {log.notes && <span className="text-gray-400 ml-1">— {log.notes}</span>}
                </span>
                <span className="text-gray-400 text-[10px]">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Health Check */}
      <div className="mt-3">
        <button
          onClick={runHealthCheck}
          disabled={healthLoading}
          className="w-full text-xs px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 font-medium transition-colors"
        >
          {healthLoading ? "🧠 Analyzing..." : "🧠 AI Health Check"}
        </button>

        {healthResult && healthResult.healthScore > 0 && (
          <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-emerald-800">Health Score</span>
              <span className={`font-bold text-lg ${
                healthResult.healthScore >= 7 ? "text-green-600" :
                healthResult.healthScore >= 4 ? "text-amber-600" : "text-red-600"
              }`}>
                {healthResult.healthScore}/10
              </span>
            </div>

            {healthResult.warnings.length > 0 && (
              <div className="mb-2">
                {healthResult.warnings.map((w, i) => (
                  <p key={i} className="text-red-700 font-medium">⚠️ {w}</p>
                ))}
              </div>
            )}

            {healthResult.observations.length > 0 && (
              <div className="mb-2">
                <p className="font-medium text-gray-700 mb-0.5">Observations:</p>
                {healthResult.observations.map((o, i) => (
                  <p key={i} className="text-gray-600">• {o}</p>
                ))}
              </div>
            )}

            {healthResult.recommendations.length > 0 && (
              <div className="mb-2">
                <p className="font-medium text-gray-700 mb-0.5">Recommendations:</p>
                {healthResult.recommendations.map((r, i) => (
                  <p key={i} className="text-gray-600">• {r}</p>
                ))}
              </div>
            )}

            {healthResult.disclaimer && (
              <p className="mt-2 text-[10px] text-gray-500 border-t border-emerald-200 pt-1">
                {healthResult.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="mt-3">
        <QRCode catId={cat.id} catName={cat.name} />
      </div>

      {/* Escalation history */}
      {cat.escalations.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs font-semibold text-amber-800 mb-2">⏰ Alert Escalation History</p>
          <div className="space-y-1.5">
            {cat.escalations.map((esc) => (
              <div key={esc.id} className="text-xs flex items-start gap-2">
                <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  esc.level === 0 ? "bg-green-200 text-green-800" :
                  esc.level >= 4 ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                }`}>
                  {esc.level === 0 ? "✓" : esc.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 leading-tight">{esc.message}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">{new Date(esc.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={toggleLostStatus}
          disabled={toggling}
          className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
            cat.isLost
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          } disabled:opacity-50`}
        >
          {cat.isLost ? "Mark as Found" : "Mark as Lost"}
        </button>
      </div>

      {cat.isLost && (
        <p className="mt-2 text-[10px] text-gray-400">
          ⚡ Temporal workflow active — escalating alerts every 24 hours
        </p>
      )}
    </div>
  );
}
