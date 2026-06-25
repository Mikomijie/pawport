"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterCatForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        breed: formData.get("breed"),
        color: formData.get("color"),
        age: formData.get("age"),
        microchipId: formData.get("microchipId"),
      }),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to register cat");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        + Register a new cat
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-white shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Register New Cat</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700">Name *</label>
            <input id="cat-name" name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="cat-breed" className="block text-sm font-medium text-gray-700">Breed</label>
            <input id="cat-breed" name="breed" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="cat-color" className="block text-sm font-medium text-gray-700">Color</label>
            <input id="cat-color" name="color" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="cat-age" className="block text-sm font-medium text-gray-700">Age (years)</label>
            <input id="cat-age" name="age" type="number" min="0" max="30" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>

        <div>
          <label htmlFor="cat-microchip" className="block text-sm font-medium text-gray-700">Microchip ID</label>
          <input id="cat-microchip" name="microchipId" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Saving..." : "Register Cat"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
