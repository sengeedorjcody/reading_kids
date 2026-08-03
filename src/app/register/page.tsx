"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-28">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌟</div>
          <h1 className="text-2xl font-black text-gray-800">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Save words and track your practice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:border-pink-400 focus:outline-none"
            />
          </div>
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
              placeholder="At least 6 characters"
              required
              minLength={6}
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
            {loading ? "Creating account..." : "Sign Up →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-500 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
