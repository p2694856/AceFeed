// app/admin/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/auth";
import prisma                from "@/lib/prisma";
import ClientUserList        from "./ClientUserList";




export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { name: true, email: true },
  });

  return <ClientUserList users={users} isAdmin={true} />;
}