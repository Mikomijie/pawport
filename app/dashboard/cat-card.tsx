"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  message: string | null;
  createdAt: string;
}

interface Cat {
  id: string;
  name: string;
  breed: string | null;
  color: string | null;
  age: number | null;
  isLost: boolean;
  lostAt: string | null;
  sightings: Sighting[];
}

export function CatCard({ cat }: { cat: Cat }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/cat/${cat.id}`;

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

  return (
    <div className={`rounded-lg bg-white shadow-md p-5 border-l-4 ${cat.isLost ? "border-red-500" : "border-green-500"}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{cat.name}</h3>
          <p className="text-sm text-gray-500">
            {[cat.breed, cat.color, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ") || "No details"}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {cat.isLost ? "LOST" : "Safe"}
        </span>
      </div>

      {/* QR Code link */}
      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
        <p className="text-gray-500 mb-1">Public profile (for QR code):</p>
        <code className="text-indigo-600 break-all">{profileUrl}</code>
      </div>

      {/* Recent sightings */}
      {cat.sightings.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Recent sightings:</p>
          {cat.sightings.map((s) => (
            <div key={s.id} className="text-xs text-gray-600 flex justify-between">
              <span>📍 {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</span>
              <span>{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
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
    </div>
  );
}
