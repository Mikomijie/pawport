import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CatCard } from "./cat-card";
import { RegisterCatForm } from "./register-cat-form";
import { LogoutButton } from "./logout-button";

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

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">🐾 PawPort</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Cats</h2>
        </div>

        <RegisterCatForm />

        {cats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">🐱</p>
            <p>No cats registered yet. Add your first cat above!</p>
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
