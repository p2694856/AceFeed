// app/api/admin/add-proxy/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const {
    fbPageId,
    accessToken,
    igBusinessId,
  } = (await request.json()) as {
    fbPageId?: string;
    accessToken?: string;
    igBusinessId?: string;
  };

  // Validate inputs
  if (!fbPageId || !accessToken || !igBusinessId) {
    return NextResponse.json(
      { error: "fbPageId, accessToken, and igBusinessId are all required" },
      { status: 400 }
    );
  }

  // Upsert the proxyAccount with all three values
  const proxy = await prisma.proxyAccount.upsert({
    where: { fbPageId },
    update: { accessToken, igBusinessId },
    create: { fbPageId, accessToken, igBusinessId },
  });

  return NextResponse.json(proxy, { status: 200 });
}