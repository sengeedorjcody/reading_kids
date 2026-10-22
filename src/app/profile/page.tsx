"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regIsAdmin, setRegIsAdmin] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

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

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    try {
      const endpoint = isAdmin ? "/api/admin/users" : "/api/auth/register";
      const payload = isAdmin
        ? { name: regName, email: regEmail, password: regPassword, isAdmin: regIsAdmin }
        : { name: regName, email: regEmail, password: regPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Бүртгэхэд алдаа гарлаа");
      }

      setRegSuccess(`"${regEmail}" хэрэглэгч амжилттай бүртгэгдлээ!`);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegIsAdmin(false);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-28 pt-8">
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

          {/* User registration button */}
          <button
            onClick={() => {
              setShowRegister((v) => !v);
              setRegError("");
              setRegSuccess("");
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl text-lg transition-all active:scale-95"
          >
            {showRegister ? "✕ Бүртгэлийн хэсгийг хаах" : "👤 Register User / Бүртгэх"}
          </button>

          {/* User registration form */}
          {showRegister && (
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 text-left space-y-3 transition-all animate-fadeIn">
              <h3 className="font-black text-gray-800 text-sm text-center">
                Шинэ хэрэглэгч бүртгэх
              </h3>

              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-xl text-xs font-semibold">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-2.5 rounded-xl text-xs font-semibold">
                  {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegisterUser} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Нэр</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Хэрэглэгчийн нэр"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Имэйл *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Нууц үг *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Мин 6 тэмдэгт"
                    required
                    minLength={6}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                {isAdmin && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 pt-1">
                    <input
                      type="checkbox"
                      checked={regIsAdmin}
                      onChange={(e) => setRegIsAdmin(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    Админ эрх олгох
                  </label>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 mt-1"
                >
                  {regLoading ? "Бүртгэж байна..." : "Хэрэглэгч бүртгэх"}
                </button>
              </form>
            </div>
          )}

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
