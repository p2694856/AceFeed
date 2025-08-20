// app/admin/proxy-assignment/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

import ProxyForm from "./ProxyForm";
import ProxyAssignmentList from "./ProxyAssignmentList";

export default async function ProxyAssignmentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return <div>Unauthorized</div>;
  }

  const [rawProxies, rawUsers] = await Promise.all([
    prisma.proxyAccount.findMany({
      include: { assignments: { include: { user: true } } },
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id,
    name: u.name ?? undefined,
    email: u.email,
  }));

  const proxies = rawProxies.map((p) => ({
    id: p.id,
    fbPageId: p.fbPageId,
    assignments: p.assignments.map((a) => ({
      id: a.id,
      user: {
        id: a.user.id,
        name: a.user.name ?? undefined,
        email: a.user.email,
      },
    })),
  }));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">Proxy Assignments</h1>
      <ProxyForm />
      <ProxyAssignmentList proxies={proxies} users={users} />
    </div>
  );
}