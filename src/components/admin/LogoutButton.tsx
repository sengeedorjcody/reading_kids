"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 text-xs font-bold whitespace-nowrap"
      >
        <span>🚪</span>
        <span>Log out</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-all font-medium text-left"
    >
      <span className="text-lg">🚪</span>
      <span>Log out</span>
    </button>
  );
}
