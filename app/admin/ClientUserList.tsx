"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface User {
  name: string | null;
  email: string;
}

export default function ClientUserList({
  users,
  isAdmin,
  

}: {
  users: User[];
  isAdmin: boolean;
  

}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (email: string) => {
    setLoading(email);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">User Directory</h1>
      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u.email}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <strong>{u.name ?? "(no name)"}</strong> — {u.email}
            </div>

            {isAdmin && (
              <button
                disabled={loading === u.email}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                onClick={() => handleDelete(u.email)}
              >
                {loading === u.email ? "Deleting…" : "Delete"}
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
        >
        Sign out
      </button>

    </main>
  );
}
