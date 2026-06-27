import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CatCard } from "./cat-card";
import { RegisterCatForm } from "./register-cat-form";
import { LogoutButton } from "./logout-button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireAuth();

  const cats = await db.cat.findMany({
    where: { ownerId: session.userId },
    include: {
      sightings: { orderBy: { createdAt: "desc" }, take: 3 },
      vaccinations: true,
      escalations: { orderBy: { createdAt: "desc" }, take: 5 },
      careLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  const lostCount = cats.filter((c) => c.isLost).length;
  const totalLogs = cats.reduce((acc, c) => acc + c.careLogs.length, 0);
  const totalSightings = cats.reduce((acc, c) => acc + c.sightings.length, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">🐾 PawPort</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Hi, {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-indigo-600">{cats.length}</p>
            <p className="text-xs text-gray-500 mt-1">Cats Registered</p>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border text-center ${lostCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
            <p className={`text-2xl font-bold ${lostCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {lostCount > 0 ? lostCount : "✓"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{lostCount > 0 ? "Currently Lost" : "All Safe"}</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalLogs}</p>
            <p className="text-xs text-gray-500 mt-1">Care Logs</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-amber-600">{totalSightings}</p>
            <p className="text-xs text-gray-500 mt-1">Sightings</p>
          </div>
        </div>

        {/* Register new cat */}
        <RegisterCatForm />

        {/* Cat list */}
        {cats.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-6xl mb-4">🐱</p>
            <p className="text-lg font-medium">No cats registered yet</p>
            <p className="text-sm mt-1">Click the button above to add your first cat and get their digital passport!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {cats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
