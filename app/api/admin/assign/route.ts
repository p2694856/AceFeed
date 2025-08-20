// app/api/admin/assign/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId, proxyId } = (await req.json()) as {
    userId: string;
    proxyId: number;
  };

  if (!userId || proxyId === undefined) {
    return NextResponse.json(
      { error: "Missing userId or proxyId" },
      { status: 400 }
    );
  }

  try {
    const assignment = await prisma.proxyAssignment.create({
      data: { userId, proxyId },
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (err: any) {
    console.error("assign error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


