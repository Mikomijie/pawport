"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">🐾 PawPort</Link>
          <p className="mt-2 text-gray-600">Enter a cat&apos;s PIN to view their profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 text-center" role="alert">
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
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="block w-full rounded-lg border border-gray-300 px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "Looking up..." : "Find Cat"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Found a cat with a PawPort tag? Enter the PIN number shown on their collar tag.
        </p>
      </div>
    </main>
  );
}
