"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";

interface Props {
  catName: string;
  allergies: string | null;
  dietaryRestrictions: string | null;
  medicalHistory: string | null;
  isLost: boolean;
}

export function FinderTips({ catName, allergies, dietaryRestrictions, medicalHistory, isLost }: Props) {
  const [tips, setTips] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  // Generate tips client-side based on available data — no API call needed
  function generateTips() {
    const generatedTips: string[] = [];

    if (isLost) {
      generatedTips.push(`${catName} is currently marked as LOST. The owner is actively looking for them.`);
      generatedTips.push("Please keep the cat safe and contact the owner immediately using the buttons above.");
    }

    if (allergies) {
      generatedTips.push(`IMPORTANT: ${catName} has allergies to: ${allergies}. Please avoid these if offering food or care.`);
    } else {
      generatedTips.push("No known allergies recorded. Standard cat food should be safe temporarily.");
    }

    if (dietaryRestrictions) {
      generatedTips.push(`Dietary note: ${catName} follows a ${dietaryRestrictions} diet.`);
    }

    if (medicalHistory) {
      generatedTips.push(`Medical note: ${medicalHistory}. Handle gently and inform the owner of any observed symptoms.`);
    }

    generatedTips.push("Provide fresh water in a clean bowl.");
    generatedTips.push("Keep the cat in a quiet, safe space away from traffic and other animals.");
    generatedTips.push("Do not force-feed. Cats can go 24 hours without food safely but need water.");

    setTips(generatedTips);
    setShow(true);
  }

  if (!show) {
    return (
      <button onClick={generateTips} className="w-full flex items-center justify-center gap-2 rounded-[12px] bg-[#F8F4F1] border border-[#E0D8D2] px-4 py-3 text-[#2C1810] font-body font-medium text-sm hover:bg-[#F0E6DF] transition-all duration-200 active:scale-[0.98]">
        <Lightbulb size={16} className="text-[#E07A5F]" /> How to care for {catName} right now
      </button>
    );
  }

  return (
    <div className="rounded-[12px] bg-[#F8F4F1] border border-[#E0D8D2] p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Lightbulb size={15} className="text-[#E07A5F]" />
        <span className="text-[13px] font-body font-semibold text-[#2C1810]">Care tips for {catName}</span>
      </div>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <p key={i} className="text-[12px] font-body text-[#2C1810] pl-3 border-l-2 border-[#E07A5F] leading-relaxed">
            {tip}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#6B5B52] font-body italic">
        These tips are based on the owner&apos;s recorded information for {catName}.
      </p>
    </div>
  );
}
