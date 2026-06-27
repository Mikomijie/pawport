"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10" style={{ background: "#FDFBF7" }}>
      <div className="w-full max-w-[420px] card p-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-[#2C1810]">PawPort</h1>
          <p className="mt-1 text-[#6B5B52] text-sm font-body">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] p-3 text-sm text-[#C1432A] font-body" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2C1810] font-body">Full Name</label>
            <input id="name" name="name" type="text" required autoComplete="name" className="mt-1 block w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-4 py-2.5 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C1810] font-body">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="mt-1 block w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-4 py-2.5 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#2C1810] font-body">Phone (optional)</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className="mt-1 block w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-4 py-2.5 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C1810] font-body">Password</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 block w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-4 py-2.5 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none focus:ring-1 focus:ring-[#E07A5F] transition-colors duration-200" />
            <p className="mt-1 text-xs text-[#6B5B52] font-body">At least 8 characters, one uppercase letter, one number</p>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary px-4 py-3 font-body font-semibold text-sm disabled:opacity-50">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B5B52] font-body">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E07A5F] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
