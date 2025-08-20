// app/api/instagram/post/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const GRAPH_API = "https://graph.facebook.com/v17.0";

export async function POST(request: Request) {
  // 1. Parse & validate
  const { userId, imageUrl, caption } = await request.json();
  if (!userId || !imageUrl || !caption) {
    return NextResponse.json(
      { success: false, error: "userId, imageUrl, and caption are required" },
      { status: 400 }
    );
  }

  // 2. Lookup assigned proxy
  const assignment = await prisma.proxyAssignment.findFirst({
  where: { userId },
  include: { proxy: true },
});

console.log("DB lookup result for", userId, "→", assignment);

if (!assignment) {
  return NextResponse.json(
    { success: false, error: "No proxy assignment found for this user" },
    { status: 404 }
  );
}


  const { igBusinessId, accessToken } = assignment.proxy;

  // 3. Create media container
  const createRes = await fetch(
    `${GRAPH_API}/${igBusinessId}/media?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption }),
    }
  );
  const createData = await createRes.json();
  if (createData.error) {
    return NextResponse.json(
      { success: false, error: createData.error.message },
      { status: 500 }
    );
  }

  const creationId = createData.id;

  // 4. Publish media
  const publishRes = await fetch(
    `${GRAPH_API}/${igBusinessId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const publishData = await publishRes.json();
  if (publishData.error) {
    return NextResponse.json(
      { success: false, error: publishData.error.message },
      { status: 500 }
    );
  }

  // 5. Return success
  return NextResponse.json({ success: true, igPostId: publishData.id });
}