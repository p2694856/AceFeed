// app/api/admin/delete-user/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth"; // adjust path if needed
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { email } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}