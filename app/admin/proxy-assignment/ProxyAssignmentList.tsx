"use client";

import { useState, useEffect } from "react";

type User = { id: string; name?: string; email: string };
type Proxy = {
  id: number;
  fbPageId: string;
  assignments: { id: string; user: User }[];
};

interface Props {
  proxies: Proxy[];
  users: User[];
}

export default function ProxyAssignmentList({ proxies, users }: Props) {
  const [data, setData] = useState({ proxies, users });
  const [selUser, setSelUser] = useState("");
  const [selProxy, setSelProxy] = useState("");
  const [fbPageId, setFbPageId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/proxies", { cache: "no-store" });
    setData(await res.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  // 1) Add Proxy
  async function addProxy(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d+$/.test(fbPageId)) {
      setError("Page ID must be numeric");
      return;
    }

    const res = await fetch("/api/admin/add-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fbPageId }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({}));
      setError(msg || `Add-proxy failed (${res.status})`);
      return;
    }

    setFbPageId("");
    refresh();
  }

  // 2) Assign user→proxy
  async function assign() {
    if (!selUser || !selProxy) return;
    await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selUser, proxyId: Number(selProxy) }),
    });
    setSelUser("");
    setSelProxy("");
    refresh();
  }

  // 3) Unassign
  async function unassign(id: string) {
    await fetch(`/api/admin/assign/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* Assignment Controls */}
      <div className="flex space-x-4 mb-8">
        <select
          className="border p-2 flex-1"
          value={selUser}
          onChange={(e) => setSelUser(e.target.value)}
        >
          <option value="">Select user</option>
          {data.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>

        <select
          className="border p-2 flex-1"
          value={selProxy}
          onChange={(e) => setSelProxy(e.target.value)}
        >
          <option value="">Select proxy</option>
          {data.proxies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fbPageId}
            </option>
          ))}
        </select>

        <button
          onClick={assign}
          disabled={!selUser || !selProxy}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Assign
        </button>
      </div>

      {/* Display */}
      {data.proxies.map((p) => (
        <div key={p.id} className="mb-6 border p-4 rounded shadow-sm">
          <h2 className="font-medium">Page: {p.fbPageId}</h2>
          {p.assignments.length === 0 ? (
            <p className="text-gray-500 mt-2">No assignments</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {p.assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  {a.user.name || a.user.email}
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => unassign(a.id)}
                  >
                    Unassign
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}