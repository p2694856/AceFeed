// app/api/admin/add-proxy/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // We only expect the fbPageId from the simplified form now
  const { fbPageId } = (await request.json()) as { fbPageId?: string };

  // Validate input
  if (!fbPageId) {
    return NextResponse.json(
      { error: "fbPageId is required" },
      { status: 400 }
    );
  }

  // Find if a proxy with this fbPageId already exists
  const existingProxy = await prisma.proxyAccount.findUnique({
    where: { fbPageId },
  });

  if (existingProxy) {
    return NextResponse.json(
      { error: "A proxy with this Facebook Page ID already exists." },
      { status: 409 } // 409 Conflict is a good status code for this
    );
  }

  // Create the proxyAccount. The accessToken and igBusinessId fields
  // are optional in the schema, so we don't need to provide them.
  const proxy = await prisma.proxyAccount.create({
    data: { 
      fbPageId,
    },
  });

  return NextResponse.json(proxy, { status: 200 });
}