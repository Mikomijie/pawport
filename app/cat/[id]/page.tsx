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

  // Get last feeding and water times
  const lastFed = cat.careLogs.find((l) => l.type === "FEEDING");
  const lastWater = cat.careLogs.find((l) => l.type === "WATER");
  const lastMed = cat.careLogs.find((l) => l.type === "MEDICATION");

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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Lost banner */}
        {cat.isLost && (
          <div className="mb-4 rounded-lg bg-red-100 border border-red-300 p-4 text-center animate-pulse">
            <p className="text-lg font-bold text-red-800">🚨 This cat is LOST</p>
            <p className="text-sm text-red-700 mt-1">
              If you found this cat, please use the button below or contact the owner directly.
            </p>
          </div>
        )}

        {/* Cat info card */}
        <div className="rounded-lg bg-white shadow-md p-6">
          <div className="text-center mb-4">
            {cat.photoUrl ? (
              <img src={cat.photoUrl} alt={cat.name} className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-indigo-100" />
            ) : (
              <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-5xl">
                🐱
              </div>
            )}
            <h1 className="mt-3 text-2xl font-bold text-gray-900">{cat.name}</h1>
            {cat.pin && (
              <p className="text-xs text-gray-400 mt-1">PIN: {cat.pin}</p>
            )}
          </div>

          <div className="space-y-3 text-sm">
            {cat.breed && (
              <div className="flex justify-between">
                <span className="text-gray-500">Breed</span>
                <span className="font-medium">{cat.breed}</span>
              </div>
            )}
            {cat.gender && (
              <div className="flex justify-between">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium">{cat.gender}</span>
              </div>
            )}
            {cat.color && (
              <div className="flex justify-between">
                <span className="text-gray-500">Color</span>
                <span className="font-medium">{cat.color}</span>
              </div>
            )}
            {cat.age && (
              <div className="flex justify-between">
                <span className="text-gray-500">Age</span>
                <span className="font-medium">{cat.age} year{cat.age > 1 ? "s" : ""}</span>
              </div>
            )}
            {cat.weight && (
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="font-medium">{cat.weight} kg</span>
              </div>
            )}
            {cat.microchipId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Microchip</span>
                <span className="font-medium font-mono text-xs">{cat.microchipId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Medical Alerts */}
        {(cat.allergies || cat.medicalHistory || cat.dietaryRestrictions) && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 shadow-md p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-3">⚠️ Medical Alerts</h2>
            <div className="space-y-2 text-sm">
              {cat.allergies && (
                <div>
                  <span className="font-medium text-red-700">Allergies:</span>
                  <p className="text-red-600">{cat.allergies}</p>
                </div>
              )}
              {cat.dietaryRestrictions && (
                <div>
                  <span className="font-medium text-red-700">Dietary Restrictions:</span>
                  <p className="text-red-600">{cat.dietaryRestrictions}</p>
                </div>
              )}
              {cat.medicalHistory && (
                <div>
                  <span className="font-medium text-red-700">Medical History:</span>
                  <p className="text-red-600">{cat.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Care Status (respects privacy) */}
        {(privacy?.showFeedingSchedule !== false) && (lastFed || lastWater || lastMed) && (
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 shadow-md p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">🕐 Recent Care</h2>
            <div className="space-y-2 text-sm">
              {lastFed && (
                <div className="flex justify-between">
                  <span className="text-blue-600">🍽️ Last Fed</span>
                  <span className="font-medium text-blue-800">{timeAgo(lastFed.completedAt || lastFed.createdAt)}</span>
                </div>
              )}
              {lastWater && (
                <div className="flex justify-between">
                  <span className="text-blue-600">💧 Last Water</span>
                  <span className="font-medium text-blue-800">{timeAgo(lastWater.completedAt || lastWater.createdAt)}</span>
                </div>
              )}
              {lastMed && (
                <div className="flex justify-between">
                  <span className="text-blue-600">💊 Last Medication</span>
                  <span className="font-medium text-blue-800">{timeAgo(lastMed.completedAt || lastMed.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner contact */}
        <div className="mt-4 rounded-lg bg-white shadow-md p-6">
          <h2 className="text-lg font-semibold mb-3">Owner Contact</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Name:</span> {cat.owner.name}</p>
            <p>
              <span className="text-gray-500">Email:</span>{" "}
              <a href={`mailto:${cat.owner.email}`} className="text-indigo-600 underline">
                {cat.owner.email}
              </a>
            </p>
            {cat.owner.phone && (privacy?.showPhone !== false) && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                <a href={`tel:${cat.owner.phone}`} className="text-indigo-600 underline">
                  {cat.owner.phone}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        {cat.emergencyContactName && (
          <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 shadow-md p-6">
            <h2 className="text-lg font-semibold text-orange-800 mb-3">🆘 Emergency Contact</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {cat.emergencyContactName}</p>
              {cat.emergencyContactPhone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <a href={`tel:${cat.emergencyContactPhone}`} className="text-orange-700 underline font-medium">
                    {cat.emergencyContactPhone}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {cat.vaccinations.length > 0 && (
          <div className="mt-4 rounded-lg bg-white shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">Vaccination Records</h2>
            <div className="space-y-2">
              {cat.vaccinations.map((vax) => (
                <div key={vax.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-medium">{vax.name}</p>
                    {vax.vetName && <p className="text-xs text-gray-500">by {vax.vetName}</p>}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{new Date(vax.date).toLocaleDateString()}</p>
                    {vax.nextDue && <p>Next: {new Date(vax.nextDue).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Found cat button */}
        <div className="mt-6">
          <FoundCatButton catId={cat.id} catName={cat.name} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by 🐾 PawPort — Digital Health Passport for Cats
        </p>
      </div>
    </main>
  );
}
