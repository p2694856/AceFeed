"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProxyForm() {
  const [fbPageId, setFbPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [igBusinessId, setIgBusinessId] = useState("");  // required
  const router = useRouter();

  async function addProxy(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/add-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fbPageId, accessToken, igBusinessId }),
    });
    setFbPageId("");
    setAccessToken("");
    setIgBusinessId("");
    router.refresh();
  }

  return (
    <form onSubmit={addProxy} className="mb-8 flex space-x-4">
      <input
        type="text"
        placeholder="FB Page ID"
        value={fbPageId}
        onChange={(e) => setFbPageId(e.target.value)}
        className="border p-2 flex-1"
        required
      />
      <input
        type="password"
        placeholder="Page Access Token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        className="border p-2 flex-1"
        required
      />
      <input
        type="text"
        placeholder="IG Business ID"
        value={igBusinessId}
        onChange={(e) => setIgBusinessId(e.target.value)}
        className="border p-2 flex-1"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Proxy
      </button>
    </form>
  );
}