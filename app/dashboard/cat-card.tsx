"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCode } from "./qr-code";

interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  message: string | null;
  createdAt: string;
}

interface Cat {
  id: string;
  pin: string;
  name: string;
  breed: string | null;
  color: string | null;
  age: number | null;
  photoUrl: string | null;
  isLost: boolean;
  lostAt: string | null;
  sightings: Sighting[];
}

export function CatCard({ cat }: { cat: Cat }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

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
        <div className="flex items-center gap-3">
          {/* Cat photo thumbnail */}
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
              {[cat.breed, cat.color, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {cat.isLost ? "LOST" : "Safe"}
        </span>
      </div>

      {/* PIN display */}
      <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-center border border-indigo-100">
        <p className="text-xs text-indigo-600 font-medium mb-1">PawPort PIN</p>
        <p className="text-2xl font-mono font-bold text-indigo-900 tracking-[0.3em]">{cat.pin}</p>
        <p className="text-xs text-indigo-500 mt-1">Write this on your cat&apos;s collar tag</p>
      </div>

      {/* QR Code */}
      <div className="mt-3">
        <QRCode catId={cat.id} catName={cat.name} />
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
