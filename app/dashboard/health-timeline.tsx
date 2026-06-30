"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

export function HealthTimeline({ catId, catName }: { catId: string; catName: string }) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function loadTimeline() {
    setLoading(true);
    setShow(true);
    try {
      const res = await fetch(`/api/cats/${catId}/timeline`);
      if (res.ok) {
        const { narrative: text } = await res.json();
        setNarrative(text);
      } else {
        setNarrative("Unable to generate timeline. Please try again.");
      }
    } catch {
      setNarrative("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (!show) {
    return (
      <button onClick={loadTimeline} className="flex items-center gap-1.5 text-[12px] font-body font-medium text-[#6B5B52] hover:text-[#E07A5F] transition-colors duration-200">
        <Clock size={13} /> Health Timeline
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gradient-to-br from-[#F8F4F1] to-[#FDF8F5] rounded-[10px] border border-[#E0D8D2]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-body font-semibold text-[#2C1810] flex items-center gap-1.5">
          <Clock size={12} className="text-[#E07A5F]" /> {catName}&apos;s Health Journey
        </span>
        <button onClick={() => setShow(false)} className="text-[10px] text-[#6B5B52] hover:text-[#2C1810] font-body transition-colors duration-200">Close</button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3">
          <div className="w-3 h-3 border-2 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[#6B5B52] font-body">Generating timeline...</span>
        </div>
      ) : (
        <p className="text-[12px] text-[#2C1810] font-body leading-relaxed">{narrative}</p>
      )}

      <button onClick={loadTimeline} disabled={loading} className="mt-2 text-[10px] text-[#E07A5F] font-body font-medium hover:underline disabled:opacity-50">
        Refresh
      </button>
    </div>
  );
}
