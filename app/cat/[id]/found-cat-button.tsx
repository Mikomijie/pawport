"use client";

import { useState } from "react";

interface Props {
  catId: string;
  catName: string;
}

export function FoundCatButton({ catId, catName }: Props) {
  const [status, setStatus] = useState<"idle" | "locating" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFoundCat() {
    setStatus("locating");
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("sending");
        try {
          const res = await fetch(`/api/cats/${catId}/sighting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              message: message || null,
            }),
          });

          if (res.ok) {
            setStatus("success");
          } else {
            const data = await res.json();
            setErrorMsg(data.error || "Failed to report sighting");
            setStatus("error");
          }
        } catch {
          setErrorMsg("Network error. Please try again.");
          setStatus("error");
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Please allow location access and try again.",
          2: "Unable to determine your location. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        setErrorMsg(messages[err.code] || "Unable to get location");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
        <p className="text-green-800 font-medium">✅ Thank you!</p>
        <p className="text-sm text-green-700 mt-1">
          Your location has been shared with {catName}&apos;s owner. They&apos;ll be so grateful!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        placeholder={`Optional: Add a message for ${catName}'s owner...`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        rows={2}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <button
        onClick={handleFoundCat}
        disabled={status === "locating" || status === "sending"}
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {status === "locating" && "📍 Getting your location..."}
        {status === "sending" && "Sending report..."}
        {status === "idle" && "📍 I Found This Cat!"}
        {status === "error" && "📍 Try Again"}
      </button>

      {errorMsg && (
        <p className="text-sm text-red-600 text-center" role="alert">{errorMsg}</p>
      )}

      <p className="text-xs text-gray-500 text-center">
        This will share your current GPS location with the owner to help reunite them with {catName}.
      </p>
    </div>
  );
}
