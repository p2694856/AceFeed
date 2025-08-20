import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proxies = await prisma.proxyAccount.findMany({
    include: { assignments: { include: { user: true } } },
  });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ proxies, users });
}