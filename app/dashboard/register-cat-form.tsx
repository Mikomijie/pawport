"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function RegisterCatForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB");
        return;
      }
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/cats", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setOpen(false);
      setPreview(null);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </div>
          <div>
            <label htmlFor="cat-photo" className="block text-sm font-medium text-gray-700">Cat Photo</label>
            <input
              ref={fileRef}
              id="cat-photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoChange}
              className="mt-1 text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-0.5 text-xs text-gray-400">Max 5MB. JPEG, PNG, WebP, or GIF.</p>
          </div>
        </div>

        {/* Basic Info */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Basic Information</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-medium text-gray-600">Name *</label>
              <input id="cat-name" name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-breed" className="block text-xs font-medium text-gray-600">Breed</label>
              <input id="cat-breed" name="breed" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-gender" className="block text-xs font-medium text-gray-600">Gender</label>
              <select id="cat-gender" name="gender" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label htmlFor="cat-age" className="block text-xs font-medium text-gray-600">Age (years)</label>
              <input id="cat-age" name="age" type="number" min="0" max="30" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-weight" className="block text-xs font-medium text-gray-600">Weight (kg)</label>
              <input id="cat-weight" name="weight" type="number" step="0.1" min="0" max="30" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-color" className="block text-xs font-medium text-gray-600">Color</label>
              <input id="cat-color" name="color" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Health Info */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Health Information</legend>
          <div className="space-y-3">
            <div>
              <label htmlFor="cat-allergies" className="block text-xs font-medium text-gray-600">Allergies</label>
              <input id="cat-allergies" name="allergies" placeholder="e.g. chicken, certain medications" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-dietary" className="block text-xs font-medium text-gray-600">Dietary Restrictions</label>
              <input id="cat-dietary" name="dietaryRestrictions" placeholder="e.g. grain-free, wet food only" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-medical" className="block text-xs font-medium text-gray-600">Medical History</label>
              <textarea id="cat-medical" name="medicalHistory" rows={2} placeholder="e.g. spayed 2023, dental cleaning 2024" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-microchip" className="block text-xs font-medium text-gray-600">Microchip ID</label>
              <input id="cat-microchip" name="microchipId" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cat-emergency-name" className="block text-xs font-medium text-gray-600">Contact Name</label>
              <input id="cat-emergency-name" name="emergencyContactName" placeholder="Backup contact person" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cat-emergency-phone" className="block text-xs font-medium text-gray-600">Contact Phone</label>
              <input id="cat-emergency-phone" name="emergencyContactPhone" type="tel" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Saving..." : "Register Cat"}
          </button>
          <button type="button" onClick={() => { setOpen(false); setPreview(null); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
