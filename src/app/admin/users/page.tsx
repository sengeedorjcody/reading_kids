"use client";

import { useEffect, useState } from "react";

interface UserItem {
  _id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Хэрэглэгчдийн жагсаалтыг ачаалахад алдаа гарлаа");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Хэрэглэгч бүртгэхэд алдаа гарлаа");
      }

      setSuccess(`"${data.user.email}" амжилттай бүртгэгдлээ!`);
      setName("");
      setEmail("");
      setPassword("");
      setIsAdmin(false);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (!confirm(`"${user.name || user.email}" хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) return;
    setDeletingId(user._id);
    try {
      const res = await fetch(`/api/admin/users?id=${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Устгахад алдаа гарлаа");
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setSuccess("Хэрэглэгч амжилттай устгагдлаа");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-800">👥 Users / Хэрэглэгчид</h1>
        <p className="text-sm text-gray-500 mt-1">Хэрэглэгч шинээр бүртгэх болон удирдах хэсэг</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* Register user form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-gray-800 mb-4">➕ Шинэ хэрэглэгч бүртгэх</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Нэр (Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Хэрэглэгчийн нэр"
              className="w-full border-2 border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Имэйл (Email) *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full border-2 border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Нууц үг (Password) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Мин 6 тэмдэгт"
              required
              minLength={6}
              className="w-full border-2 border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 select-none">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400"
              />
              Админ эрх
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="ml-auto bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 px-5 rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Бүртгэж байна..." : "Бүртгэх"}
            </button>
          </div>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">
            Бүртгэлтэй хэрэглэгчид ({users.length})
          </h2>
          <button
            onClick={fetchUsers}
            className="text-sm font-bold text-gray-500 hover:text-gray-700"
          >
            🔄 Шинэчлэх
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 font-medium">Ачаалж байна...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium">Одоогоор хэрэглэгч бүртгэгдээгүй байна</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Нэр</th>
                  <th className="py-3 px-6">Имэйл</th>
                  <th className="py-3 px-6">Эрх</th>
                  <th className="py-3 px-6">Бүртгэсэн огноо</th>
                  <th className="py-3 px-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {user.name || "—"}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6">
                      {user.isAdmin ? (
                        <span className="bg-pink-100 text-pink-700 text-xs font-black px-2.5 py-1 rounded-full">
                          ⚙️ Админ
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          👤 Хэрэглэгч
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user._id}
                        className="text-red-500 hover:text-red-700 font-bold text-xs px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
                      >
                        {deletingId === user._id ? "Устгаж байна..." : "Устгах"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
