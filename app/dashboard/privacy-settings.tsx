"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

interface Props {
  catId: string;
}

interface Settings {
  showPhone: boolean;
  showAddress: boolean;
  showFeedingSchedule: boolean;
  showLocation: boolean;
  showGPSHistory: boolean;
}

const labels: Record<keyof Settings, string> = {
  showPhone: "Show phone number to finders",
  showAddress: "Show address to finders",
  showFeedingSchedule: "Show feeding/care schedule",
  showLocation: "Show last known location",
  showGPSHistory: "Show GPS sighting history",
};

export function PrivacySettings({ catId }: Props) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && !settings) {
      fetch(`/api/cats/${catId}/privacy`)
        .then((res) => res.json())
        .then((data) => setSettings(data))
        .catch(() => {});
    }
  }, [open, catId, settings]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    await fetch(`/api/cats/${catId}/privacy`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggle(field: keyof Settings) {
    if (!settings) return;
    setSettings({ ...settings, [field]: !settings[field] });
    setSaved(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[13px] text-[#6B5B52] hover:text-[#E07A5F] font-body font-medium transition-colors duration-200"
      >
        <Shield size={14} />
        Privacy Settings
      </button>
    );
  }

  return (
    <div className="p-4 bg-[#F8F4F1] rounded-[10px]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-body font-semibold text-[#2C1810] flex items-center gap-1.5">
          <Shield size={14} /> Privacy Controls
        </p>
        <button onClick={() => setOpen(false)} className="text-[13px] text-[#6B5B52] hover:text-[#2C1810] font-body transition-colors duration-200">Close</button>
      </div>

      {!settings ? (
        <p className="text-[13px] text-[#6B5B52] font-body">Loading...</p>
      ) : (
        <div className="space-y-3">
          {(Object.keys(labels) as (keyof Settings)[]).map((field) => (
            <label key={field} className="flex items-center justify-between cursor-pointer">
              <span className="text-[13px] text-[#2C1810] font-body">{labels[field]}</span>
              <button
                type="button"
                onClick={() => toggle(field)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  settings[field] ? "bg-[#E07A5F]" : "bg-[#E0D8D2]"
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${settings[field] ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </label>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="text-[13px] font-body font-medium px-4 py-2 bg-[#E07A5F] text-white rounded-[10px] hover:opacity-90 disabled:opacity-50 transition-opacity duration-200">
              {saving ? "Saving..." : "Save"}
            </button>
            {saved && <span className="text-[13px] text-[#81B29A] font-body font-medium">Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}
