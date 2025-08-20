// app/api/meta/fetch-token/route.ts

import { NextResponse } from "next/server";
import { fetchPageAccessToken } from "@/lib/meta";

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

  const accessToken = await fetchPageAccessToken(
    fbPageId,
    systemUserToken
  );

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unable to retrieve page access token" },
      { status: 502 }
    );
  }

  return NextResponse.json({ accessToken }, { status: 200 });
}
