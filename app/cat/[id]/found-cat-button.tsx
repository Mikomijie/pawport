"use client";

import { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";

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
      <div className="rounded-[12px] bg-[#EDF7F2] border border-[#81B29A] p-5 text-center">
        <CheckCircle size={24} className="mx-auto text-[#2D6A4F]" />
        <p className="mt-2 font-body font-semibold text-[#2D6A4F]">Thank you!</p>
        <p className="text-sm text-[#6B5B52] font-body mt-1">
          Your location has been shared with {catName}&apos;s owner.
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
        className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-4 py-3 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200"
      />

      <button
        onClick={handleFoundCat}
        disabled={status === "locating" || status === "sending"}
        className="w-full flex items-center justify-center gap-2 rounded-[12px] bg-[#E07A5F] px-4 py-4 text-white font-body font-bold text-base hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
        style={{ height: "56px" }}
      >
        <MapPin size={18} />
        {status === "locating" && "Getting your location..."}
        {status === "sending" && "Sending report..."}
        {status === "idle" && "I Found This Cat"}
        {status === "error" && "Try Again"}
      </button>

      {errorMsg && (
        <p className="text-sm text-[#C1432A] text-center font-body" role="alert">{errorMsg}</p>
      )}

      <p className="text-[11px] text-[#6B5B52] text-center font-body">
        This will share your current GPS location with the owner to help reunite them with {catName}.
      </p>
    </div>
  );
}
