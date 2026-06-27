import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FoundCatButton } from "./found-cat-button";

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
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md">

        {/* Lost banner */}
        {cat.isLost && (
          <div className="mb-4 rounded-2xl bg-red-500 p-5 text-center text-white shadow-lg animate-pulse">
            <p className="text-2xl font-bold">🚨 LOST CAT</p>
            <p className="text-sm mt-1 text-red-100">
              Please help! If you&apos;ve found this cat, contact the owner below or tap &quot;I Found This Cat&quot;.
            </p>
          </div>
        )}

        {/* Cat Profile Card */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          {/* Photo header */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center">
            {cat.photoUrl ? (
              <img
                src={cat.photoUrl}
                alt={cat.name}
                className="mx-auto h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="mx-auto h-28 w-28 rounded-full bg-white/20 flex items-center justify-center text-5xl border-4 border-white/30">
                🐱
              </div>
            )}
            <h1 className="mt-3 text-2xl font-bold text-white">{cat.name}</h1>
            <p className="text-indigo-100 text-sm mt-1">
              {[cat.breed, cat.gender, cat.age ? `${cat.age}y` : null].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              {cat.weight && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-semibold text-gray-900">{cat.weight} kg</p>
                </div>
              )}
              {cat.color && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="font-semibold text-gray-900">{cat.color}</p>
                </div>
              )}
              {cat.microchipId && (
                <div className="rounded-lg bg-gray-50 p-3 col-span-2">
                  <p className="text-xs text-gray-500">Microchip</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">{cat.microchipId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Alerts */}
        {(cat.allergies || cat.dietaryRestrictions) && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-5">
            <h2 className="font-bold text-red-800 flex items-center gap-2">
              <span className="text-lg">⚠️</span> Medical Alerts
            </h2>
            <div className="mt-2 space-y-2 text-sm">
              {cat.allergies && (
                <div className="rounded-lg bg-red-100 px-3 py-2">
                  <span className="font-medium text-red-800">Allergies:</span>
                  <span className="text-red-700 ml-1">{cat.allergies}</span>
                </div>
              )}
              {cat.dietaryRestrictions && (
                <div className="rounded-lg bg-red-100 px-3 py-2">
                  <span className="font-medium text-red-800">Diet:</span>
                  <span className="text-red-700 ml-1">{cat.dietaryRestrictions}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Care (respects privacy) */}
        {(privacy?.showFeedingSchedule !== false) && (lastFed || lastWater) && (
          <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-5">
            <h2 className="font-bold text-blue-800 flex items-center gap-2">
              <span className="text-lg">🕐</span> Last Care
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {lastFed && (
                <div className="rounded-lg bg-white p-3 text-center border border-blue-100">
                  <p className="text-lg">🍽️</p>
                  <p className="text-xs text-gray-500 mt-1">Last Fed</p>
                  <p className="text-sm font-semibold text-gray-900">{timeAgo(lastFed.completedAt || lastFed.createdAt)}</p>
                </div>
              )}
              {lastWater && (
                <div className="rounded-lg bg-white p-3 text-center border border-blue-100">
                  <p className="text-lg">💧</p>
                  <p className="text-xs text-gray-500 mt-1">Last Water</p>
                  <p className="text-sm font-semibold text-gray-900">{timeAgo(lastWater.completedAt || lastWater.createdAt)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Buttons — prominent, one-tap */}
        <div className="mt-4 rounded-2xl bg-white shadow-lg p-5">
          <h2 className="font-bold text-gray-900 mb-3">Contact Owner</h2>
          <div className="space-y-2">
            {cat.owner.phone && (privacy?.showPhone !== false) && (
              <a
                href={`tel:${cat.owner.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-4 py-3.5 text-white font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                📞 Call {cat.owner.name}
              </a>
            )}
            <a
              href={`mailto:${cat.owner.email}?subject=Found your cat ${cat.name}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ✉️ Email Owner
            </a>
            {cat.emergencyContactPhone && (
              <a
                href={`tel:${cat.emergencyContactPhone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-white font-semibold hover:bg-orange-600 transition-colors shadow-sm"
              >
                🆘 Emergency: {cat.emergencyContactName || "Contact"}
              </a>
            )}
          </div>
        </div>

        {/* Vaccinations */}
        {cat.vaccinations.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white shadow-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3">💉 Vaccinations</h2>
            <div className="space-y-2">
              {cat.vaccinations.map((vax) => (
                <div key={vax.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{vax.name}</p>
                    {vax.vetName && <p className="text-xs text-gray-500">by {vax.vetName}</p>}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{new Date(vax.date).toLocaleDateString()}</p>
                    {vax.nextDue && <p className="text-amber-600">Due: {new Date(vax.nextDue).toLocaleDateString()}</p>}
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

        {/* Footer */}
        <div className="mt-8 text-center pb-4">
          <p className="text-xs text-gray-400">
            🐾 PawPort — Digital Health Passport for Cats
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            No app needed. Scan QR or enter PIN at pawport.app/find
          </p>
        </div>
      </div>
    </main>
  );
}
