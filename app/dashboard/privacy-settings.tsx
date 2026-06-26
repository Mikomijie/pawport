"use client";

import { useState, useEffect } from "react";

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
        className="text-xs text-gray-400 hover:text-indigo-600 underline transition-colors"
      >
        🔒 Privacy Settings
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-700">🔒 Privacy Controls</p>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
      </div>

      {!settings ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-2">
          {(Object.keys(labels) as (keyof Settings)[]).map((field) => (
            <label key={field} className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-600">{labels[field]}</span>
              <button
                type="button"
                onClick={() => toggle(field)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings[field] ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    settings[field] ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {saved && <span className="text-xs text-green-600">✓ Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}
