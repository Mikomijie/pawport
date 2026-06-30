import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FoundCatButton } from "./found-cat-button";
import { FinderTips } from "./finder-tips";
import { AlertTriangle, Phone, Mail, UtensilsCrossed, Droplets } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const cat = await db.cat.findUnique({ where: { id } });
  return {
    title: cat ? `${cat.name} — PawPort` : "Cat Not Found",
    description: cat ? `View ${cat.name}'s profile on PawPort` : undefined,
  };
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default async function CatProfilePage({ params }: Props) {
  const { id } = await params;

  const cat = await db.cat.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
      vaccinations: { orderBy: { date: "desc" } },
      privacySettings: true,
      careLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!cat) notFound();

  const privacy = cat.privacySettings;
  const lastFed = cat.careLogs.find((l) => l.type === "FEEDING");
  const lastWater = cat.careLogs.find((l) => l.type === "WATER");

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      {/* Hero photo */}
      <div className="relative w-full h-[280px] bg-[#F0E6DF]">
        {cat.photoUrl ? (
          <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#E0D8D2] flex items-center justify-center">
              <span className="text-[#C4A99A] text-3xl font-body font-bold">{cat.name[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content overlapping */}
      <div className="mx-auto max-w-md px-4 -mt-8 relative z-10 pb-10">

        {/* Main info card */}
        <div className="bg-white rounded-t-[20px] rounded-b-[16px] shadow-lg p-6">
          <h1 className="font-display font-bold text-[28px] text-[#2C1810]">{cat.name}</h1>
          <p className="text-sm text-[#6B5B52] font-body mt-1">
            {[cat.breed, cat.gender, cat.age ? `${cat.age} years` : null, cat.weight ? `${cat.weight}kg` : null].filter(Boolean).join(" · ")}
          </p>

          {cat.pin && (
            <p className="mt-2 text-[11px] text-[#6B5B52] font-body">PIN: <span className="font-bold tracking-wider">{cat.pin}</span></p>
          )}
        </div>

        {/* Lost banner */}
        {cat.isLost && (
          <div className="mt-4 bg-[#FEF2F2] border-l-4 border-[#C1432A] rounded-[12px] p-4">
            <p className="font-body font-bold text-base text-[#C1432A]">This cat is LOST</p>
            <p className="text-sm text-[#6B5B52] font-body mt-1">If you found this cat please use the button below</p>
          </div>
        )}

        {/* Medical alerts */}
        {(cat.allergies || cat.dietaryRestrictions) && (
          <div className="mt-4 bg-[#FEF2F2] rounded-[12px] p-4">
            <p className="font-body font-semibold text-sm text-[#C1432A] flex items-center gap-1.5">
              <AlertTriangle size={14} /> Medical Alerts
            </p>
            <div className="mt-2 space-y-1.5">
              {cat.allergies && <p className="text-sm font-body text-[#2C1810]">Allergies: {cat.allergies}</p>}
              {cat.dietaryRestrictions && <p className="text-sm font-body text-[#2C1810]">Diet: {cat.dietaryRestrictions}</p>}
            </div>
          </div>
        )}

        {/* Last care */}
        {(privacy?.showFeedingSchedule !== false) && (lastFed || lastWater) && (
          <div className="mt-4 bg-[#EDF7F2] rounded-[12px] p-4">
            <div className="grid grid-cols-2 gap-3">
              {lastFed && (
                <div className="text-center">
                  <UtensilsCrossed size={18} className="mx-auto text-[#2D6A4F]" />
                  <p className="text-[11px] text-[#6B5B52] font-body mt-1">Last Fed</p>
                  <p className="text-sm font-body font-semibold text-[#2C1810]">{timeAgo(lastFed.completedAt || lastFed.createdAt)}</p>
                </div>
              )}
              {lastWater && (
                <div className="text-center">
                  <Droplets size={18} className="mx-auto text-[#2D6A4F]" />
                  <p className="text-[11px] text-[#6B5B52] font-body mt-1">Last Water</p>
                  <p className="text-sm font-body font-semibold text-[#2C1810]">{timeAgo(lastWater.completedAt || lastWater.createdAt)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="mt-4 space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body font-medium">Contact Owner</p>

          {cat.owner.phone && (privacy?.showPhone !== false) && (
            <a href={`tel:${cat.owner.phone}`} className="flex items-center justify-center gap-2 w-full rounded-[12px] bg-[#81B29A] px-4 py-4 text-white font-body font-semibold text-base hover:opacity-90 transition-opacity duration-200">
              <Phone size={18} /> Call {cat.owner.name}
            </a>
          )}
          <a href={`mailto:${cat.owner.email}?subject=Found your cat ${cat.name}`} className="flex items-center justify-center gap-2 w-full rounded-[12px] bg-[#2C1810] px-4 py-4 text-white font-body font-semibold text-base hover:opacity-90 transition-opacity duration-200">
            <Mail size={18} /> Email Owner
          </a>
          {cat.emergencyContactPhone && (
            <a href={`tel:${cat.emergencyContactPhone}`} className="flex items-center justify-center gap-2 w-full rounded-[12px] bg-[#E07A5F] px-4 py-4 text-white font-body font-semibold text-base hover:opacity-90 transition-opacity duration-200">
              <Phone size={18} /> Emergency: {cat.emergencyContactName || "Contact"}
            </a>
          )}
        </div>

        {/* Vaccinations */}
        {cat.vaccinations.length > 0 && (
          <div className="mt-4 card p-5">
            <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body font-medium mb-3">Vaccinations</p>
            <div className="space-y-2">
              {cat.vaccinations.map((vax) => (
                <div key={vax.id} className="flex justify-between text-sm font-body border-b border-[#F0E6DF] pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-[#2C1810]">{vax.name}</p>
                    {vax.vetName && <p className="text-[11px] text-[#6B5B52]">by {vax.vetName}</p>}
                  </div>
                  <div className="text-right text-[11px] text-[#6B5B52]">
                    <p>{new Date(vax.date).toLocaleDateString()}</p>
                    {vax.nextDue && <p className="text-[#E07A5F]">Due: {new Date(vax.nextDue).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Found Cat Button */}
        <div className="mt-6">
          <FoundCatButton catId={cat.id} catName={cat.name} />
        </div>

        {/* Finder Tips — AI-powered care guidance */}
        <div className="mt-4">
          <FinderTips
            catName={cat.name}
            allergies={cat.allergies}
            dietaryRestrictions={cat.dietaryRestrictions}
            medicalHistory={cat.medicalHistory}
            isLost={cat.isLost}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#6B5B52] font-body">PawPort — Digital Health Passport for Cats</p>
        </div>
      </div>
    </main>
  );
}
