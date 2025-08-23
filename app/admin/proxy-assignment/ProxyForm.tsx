// app/admin/proxy-assignment/ProxyForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProxyForm() {
  const [fbPageId, setFbPageId] = useState("");
  const router = useRouter();

  async function addProxy(e: React.FormEvent) {
    e.preventDefault();
    // We only need to send the fbPageId now for record-keeping
    await fetch("/api/admin/add-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fbPageId }),
    });
    setFbPageId("");
    router.refresh();
  }

  return (
    <form onSubmit={addProxy} className="mb-8 flex space-x-4">
      <input
        type="text"
        placeholder="FB Page ID (for your reference)"
        value={fbPageId}
        onChange={(e) => setFbPageId(e.target.value)}
        className="border p-2 flex-1"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Proxy Reference
      </button>
    </form>
  );
}