// app/api/admin/add-proxy/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchPageAccessToken } from "@/lib/meta";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { fbPageId } = (await request.json()) as { fbPageId: string };

  const systemUserToken = process.env.META_SYSTEM_USER_TOKEN;
  if (!systemUserToken) {
    return NextResponse.json(
      { error: "Missing META_SYSTEM_USER_TOKEN env var" },
      { status: 500 }
    );
  }

  // 1. fetch the page’s long-lived access token
  const accessToken = await fetchPageAccessToken(
    fbPageId,
    systemUserToken
  );
  if (!accessToken) {
    return NextResponse.json(
      { error: "Failed to fetch page access token" },
      { status: 502 }
    );
  }

  const igResponse = await fetch(
  `https://graph.facebook.com/${fbPageId}` +
    `?fields=instagram_business_account` +
    `&access_token=${accessToken}`
);
const igJson = await igResponse.json();
const igBusinessId = igJson.instagram_business_account?.id;

if (!igBusinessId) {
  console.warn(`No IG Business Account linked to Page ${fbPageId}`);
}

// 2. upsert including igBusinessId
const proxy = await prisma.proxyAccount.upsert({
  where: { fbPageId },
  update: { accessToken, igBusinessId },
  create: { fbPageId, accessToken, igBusinessId },
});

  try {
    // 2. upsert so we never violate UNIQUE(fbPageId)
    const proxy = await prisma.proxyAccount.upsert({
      where: { fbPageId },
      update: { accessToken },
      create: { fbPageId, accessToken },
    });

    // Always returns 200; you can sniff created vs. updated on the front end if needed
    return NextResponse.json(proxy, { status: 200 });
  } catch (err: any) {
    // you shouldn’t hit P2002 now, but just in case
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This FB Page is already added." },
        { status: 409 }
      );
    }
    console.error("[add-proxy]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}