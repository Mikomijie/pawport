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
    <main className="min-h-screen relative" style={{ background: "#FDFBF7" }}>
      {/* Subtle paw print background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cellipse cx='30' cy='38' rx='8' ry='10' fill='%23F0EBE6'/%3E%3Ccircle cx='22' cy='26' r='4' fill='%23F0EBE6'/%3E%3Ccircle cx='38' cy='26' r='4' fill='%23F0EBE6'/%3E%3Ccircle cx='18' cy='34' r='3.5' fill='%23F0EBE6'/%3E%3Ccircle cx='42' cy='34' r='3.5' fill='%23F0EBE6'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }} />
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-[#F0E6DF] relative">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-display font-bold text-xl text-[#2C1810] hover:opacity-80 transition-opacity duration-200">PawPort</Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#6B5B52] font-body hidden sm:inline">Hi, {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 relative z-[1]">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card p-4 text-center transition-all duration-200">
            <p className="font-display font-bold text-[32px] text-[#E07A5F]">{cats.length}</p>
            <p className="text-[13px] text-[#6B5B52] font-body mt-1">Cats Registered</p>
          </div>
          <div className="card p-4 text-center transition-all duration-200">
            <p className={`font-display font-bold text-[32px] ${lostCount > 0 ? "text-[#C1432A]" : "text-[#81B29A]"}`}>
              {lostCount > 0 ? lostCount : "All Safe"}
            </p>
            <p className="text-[13px] text-[#6B5B52] font-body mt-1">{lostCount > 0 ? "Currently Lost" : "Status"}</p>
          </div>
          <div className="card p-4 text-center transition-all duration-200">
            <p className="font-display font-bold text-[32px] text-[#E07A5F]">{totalLogs}</p>
            <p className="text-[13px] text-[#6B5B52] font-body mt-1">Care Logs</p>
          </div>
          <div className="card p-4 text-center transition-all duration-200">
            <p className="font-display font-bold text-[32px] text-[#E07A5F]">{totalSightings}</p>
            <p className="text-[13px] text-[#6B5B52] font-body mt-1">Sightings</p>
          </div>
        </div>

        <RegisterCatForm />

        {cats.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8F4F1] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="1.5"><path d="M12 5c-1.5-2-4-2.5-5.5-1S4 6 5.5 8c1 1.3 3 2 6.5 2s5.5-.7 6.5-2c1.5-2 .5-4.5-1-5.5S13.5 3 12 5z"/><path d="M12 10v8"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>
            </div>
            <h2 className="font-display font-bold text-2xl text-[#2C1810]">Welcome to PawPort</h2>
            <p className="mt-2 text-[#6B5B52] font-body text-base max-w-sm mx-auto">Register your first cat to get started with their digital health passport</p>
            <button
              onClick={() => {}}
              className="mt-6 btn-primary px-8 py-3 font-body font-semibold text-base inline-block cursor-default"
            >
              Register Your First Cat
            </button>
            <p className="mt-3 text-[13px] text-[#6B5B52] font-body">Use the form above to add your cat</p>
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
