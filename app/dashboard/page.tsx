import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CatCard } from "./cat-card";
import { RegisterCatForm } from "./register-cat-form";
import { LogoutButton } from "./logout-button";
import { PawLogo } from "../components/paw-logo";
import { Cat, AlertTriangle, ClipboardList, MapPin } from "lucide-react";
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
      {/* Paw print background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='28' cy='18' r='5' fill='%232C1810'/%3E%3Ccircle cx='52' cy='18' r='5' fill='%232C1810'/%3E%3Ccircle cx='20' cy='32' r='4.5' fill='%232C1810'/%3E%3Ccircle cx='60' cy='32' r='4.5' fill='%232C1810'/%3E%3Cellipse cx='40' cy='46' rx='11' ry='13' fill='%232C1810'/%3E%3C/svg%3E")`,
        backgroundSize: "80px 80px",
      }} />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-[#F0E6DF]">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <PawLogo size={24} />
            <span className="font-display font-bold text-lg text-[#2C1810]">PawPort</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[12px] sm:text-[13px] text-[#6B5B52] font-body hidden sm:inline">Hi, {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 relative z-[1]">
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="stat-card px-5 py-3 text-center min-w-[140px] max-w-[200px]">
            <Cat size={16} className="mx-auto text-[#E07A5F] mb-1" />
            <p className="font-display font-bold text-[36px] text-[#E07A5F] leading-tight">{cats.length}</p>
            <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body mt-0.5">Cats</p>
          </div>
          <div className="stat-card px-5 py-3 text-center min-w-[140px] max-w-[200px]">
            <AlertTriangle size={16} className={`mx-auto mb-1 ${lostCount > 0 ? "text-[#C1432A]" : "text-[#81B29A]"}`} />
            <p className={`font-display font-bold text-[36px] leading-tight ${lostCount > 0 ? "text-[#C1432A]" : "text-[#81B29A]"}`}>
              {lostCount > 0 ? lostCount : "0"}
            </p>
            <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body mt-0.5">{lostCount > 0 ? "Lost" : "All Safe"}</p>
          </div>
          <div className="stat-card px-5 py-3 text-center min-w-[140px] max-w-[200px]">
            <ClipboardList size={16} className="mx-auto text-[#E07A5F] mb-1" />
            <p className="font-display font-bold text-[36px] text-[#E07A5F] leading-tight">{totalLogs}</p>
            <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body mt-0.5">Care Logs</p>
          </div>
          <div className="stat-card px-5 py-3 text-center min-w-[140px] max-w-[200px]">
            <MapPin size={16} className="mx-auto text-[#E07A5F] mb-1" />
            <p className="font-display font-bold text-[36px] text-[#E07A5F] leading-tight">{totalSightings}</p>
            <p className="text-[11px] uppercase tracking-widest text-[#6B5B52] font-body mt-0.5">Sightings</p>
          </div>
        </div>

        <RegisterCatForm autoExpand={cats.length === 0} />

        {cats.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#F8F4F1] flex items-center justify-center">
              <PawLogo size={36} />
            </div>
            <h2 className="font-display font-bold text-2xl text-[#2C1810]">Welcome to PawPort</h2>
            <p className="mt-2 text-[#6B5B52] font-body text-base max-w-sm mx-auto">Register your first cat to get started with their digital health passport</p>
            <p className="mt-5 text-[13px] text-[#6B5B52] font-body">Use the form above to add your cat</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {cats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
