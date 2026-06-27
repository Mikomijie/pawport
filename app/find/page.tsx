"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

export default function FindCatPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!/^\d{6}$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/cats/lookup?pin=${pin}`);
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/cat/${id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Cat not found");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: "#FDFBF7" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-[#2C1810]">PawPort</Link>
          <h2 className="mt-4 font-display font-bold text-[32px] text-[#2C1810]">Found a Cat?</h2>
          <p className="mt-2 text-[#6B5B52] text-[15px] font-body">Enter the 6-digit PIN from their collar tag</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] p-3 text-sm text-[#C1432A] text-center font-body" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="pin" className="sr-only">6-digit PIN</label>
            <input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="block w-full rounded-[12px] border-2 border-[#E0D8D2] bg-white px-4 py-5 text-center text-2xl font-body font-bold tracking-[8px] text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200"
              style={{ height: "64px" }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="w-full btn-primary px-4 py-4 font-body font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search size={18} />
            {loading ? "Looking up..." : "Find Cat"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B5B52] font-body">
          Found a cat with a PawPort tag? Enter the PIN number shown on their collar.
        </p>
      </div>
    </main>
  );
}
