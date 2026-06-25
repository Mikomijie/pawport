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
    },
  });

  if (!cat) notFound();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Lost banner */}
        {cat.isLost && (
          <div className="mb-4 rounded-lg bg-red-100 border border-red-300 p-4 text-center">
            <p className="text-lg font-bold text-red-800">🚨 This cat is LOST</p>
            <p className="text-sm text-red-700 mt-1">
              If you found this cat, please use the button below or contact the owner directly.
            </p>
          </div>
        )}

        {/* Cat info card */}
        <div className="rounded-lg bg-white shadow-md p-6">
          <div className="text-center mb-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl">
              🐱
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">{cat.name}</h1>
          </div>

          <div className="space-y-3 text-sm">
            {cat.breed && (
              <div className="flex justify-between">
                <span className="text-gray-500">Breed</span>
                <span className="font-medium">{cat.breed}</span>
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
            {cat.microchipId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Microchip</span>
                <span className="font-medium font-mono text-xs">{cat.microchipId}</span>
              </div>
            )}
          </div>
        </div>

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
            {cat.owner.phone && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                <a href={`tel:${cat.owner.phone}`} className="text-indigo-600 underline">
                  {cat.owner.phone}
                </a>
              </p>
            )}
          </div>
        </div>

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
          Powered by 🐾 PawPort — Keeping cats safe
        </p>
      </div>
    </main>
  );
}
