"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Wrong email or password");
      setLoading(false);
    } else {
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-28">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="text-2xl font-black text-gray-800">Welcome back!</h1>
          <p className="text-gray-400 text-sm mt-1">Log in to save words and practice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:border-pink-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:border-pink-400 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 font-medium text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Log In →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          No account yet?{" "}
          <Link href="/register" className="text-pink-500 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
