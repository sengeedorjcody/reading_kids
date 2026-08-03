"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200/30 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-28">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Not logged in</h1>
          <p className="text-gray-400 text-sm mb-6">Log in to save words and track your daily practice</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = Boolean((session.user as { isAdmin?: boolean }).isAdmin);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-28">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-3">🙋</div>
        <h1 className="text-2xl font-black text-gray-800 mb-1">
          {session.user.name || session.user.email}
        </h1>
        <p className="text-gray-400 text-sm mb-6">{session.user.email}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/my-words"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
          >
            📚 My Saved Words
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
            >
              ⚙️ Admin Panel
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
