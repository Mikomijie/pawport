"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Camera } from "lucide-react";

export function RegisterCatForm({ autoExpand = false }: { autoExpand?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(autoExpand);
  const [showHealth, setShowHealth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
      setPreview(URL.createObjectURL(file));
    } else { setPreview(null); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/cats", { method: "POST", body: formData });
    if (res.ok) { setOpen(false); setPreview(null); setShowHealth(false); router.refresh(); }
    else { const data = await res.json(); setError(data.error || "Failed to register cat"); }
    setLoading(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-5 w-full rounded-2xl bg-[#E07A5F] text-white p-4 font-body font-semibold text-sm hover:bg-[#C96B52] transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md">
        + Register a new cat
      </button>
    );
  }

  return (
    <div className="mb-5 card p-6 relative overflow-hidden">
      {/* Decorative cat silhouette */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]">
        <svg viewBox="0 0 100 100" fill="#E07A5F"><ellipse cx="50" cy="60" rx="30" ry="35"/><polygon points="25,30 35,5 45,28"/><polygon points="55,28 65,5 75,30"/><circle cx="40" cy="50" r="3"/><circle cx="60" cy="50" r="3"/></svg>
      </div>

      <h3 className="font-display font-bold text-xl text-[#2C1810] mb-4">Register Your Cat</h3>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        {error && <div className="rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] p-2.5 text-[13px] text-[#C1432A] font-body" role="alert">{error}</div>}

        {/* Photo + basic fields */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="h-[72px] w-[72px] rounded-full bg-[#F8F4F1] border-2 border-dashed border-[#E0D8D2] flex items-center justify-center overflow-hidden hover:border-[#E07A5F] transition-colors duration-200">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <Camera size={22} className="text-[#C4A99A]" />
              )}
            </div>
            <input ref={fileRef} name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2.5">
            <div className="col-span-2 sm:col-span-1">
              <input name="name" required placeholder="Cat name *" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <input name="breed" placeholder="Breed" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            </div>
            <select name="gender" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200">
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
            <input name="age" type="number" min="0" max="30" placeholder="Age (yrs)" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <input name="color" placeholder="Color" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
          <input name="weight" type="number" step="0.1" min="0" max="30" placeholder="Weight (kg)" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
        </div>

        {/* Expandable health section */}
        <button type="button" onClick={() => setShowHealth(!showHealth)} className="flex items-center gap-1.5 text-[13px] font-body font-medium text-[#E07A5F] hover:text-[#C1432A] transition-colors duration-200">
          <ChevronDown size={14} className={`transition-transform duration-200 ${showHealth ? "rotate-180" : ""}`} />
          {showHealth ? "Hide health details" : "Add health details (optional)"}
        </button>

        {showHealth && (
          <div className="space-y-2.5 animate-fade-in pt-1">
            <input name="allergies" placeholder="Allergies (e.g. chicken, certain meds)" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            <input name="dietaryRestrictions" placeholder="Dietary restrictions (e.g. grain-free)" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            <textarea name="medicalHistory" rows={2} placeholder="Medical history (e.g. spayed 2023)" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200 resize-none" />
            <input name="microchipId" placeholder="Microchip ID" className="w-full rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            <div className="grid grid-cols-2 gap-2.5">
              <input name="emergencyContactName" placeholder="Emergency contact name" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
              <input name="emergencyContactPhone" type="tel" placeholder="Emergency phone" className="rounded-[10px] border-[1.5px] border-[#E0D8D2] bg-[#FDFBF7] px-3 py-2.5 text-sm font-body text-[#2C1810] placeholder:text-[#C4A99A] focus:border-[#E07A5F] focus:outline-none transition-colors duration-200" />
            </div>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 font-body font-semibold text-sm disabled:opacity-50">
            {loading ? "Saving..." : "Register Cat"}
          </button>
          <button type="button" onClick={() => { setOpen(false); setPreview(null); setShowHealth(false); }} className="px-4 py-2.5 rounded-[10px] border border-[#E0D8D2] text-sm font-body text-[#6B5B52] hover:bg-[#F8F4F1] transition-colors duration-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
