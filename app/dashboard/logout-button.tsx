"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-[13px] text-[#6B5B52] hover:text-[#2C1810] font-body font-medium transition-colors duration-200"
    >
      <LogOut size={14} />
      Logout
    </button>
  );
}
