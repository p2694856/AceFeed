// app/api/posts/publish/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN!;
const GRAPH_API       = "https://graph.facebook.com/v17.0";

export async function POST(req: Request) {
  // 1. Authenticate internal call
  const token = req.headers.get("x-internal-token");
  if (token !== INTERNAL_TOKEN) {
    return NextResponse.json(
      { error: "Forbidden – invalid internal token" },
      { status: 403 }
    );
  }

  // 2. Fetch all unpublished posts
  const posts = await prisma.post.findMany({
    where:  { published: false },
    select: { id: true, content: true, imageUrl: true },
  });

  if (posts.length === 0) {
    return NextResponse.json({ results: [], message: "No new posts" });
  }

  // 3. Load all proxy assignments
  const assignments = await prisma.proxyAssignment.findMany({
    include: { proxy: true },
  });

  const results: Array<{
    postId:  number;
    pageId:  string;
    success: boolean;
    error?:  string;
  }> = [];

  // 4. Publish loop
  for (const post of posts) {
    for (const { proxy } of assignments) {
      // Choose the IG business account or fallback to page ID
      const pageId      = proxy.igBusinessId ?? proxy.fbPageId;
      const accessToken = proxy.accessToken;

      try {
        // a) Create media container
        const mediaRes = await fetch(
          `${GRAPH_API}/${pageId}/media`,
          {
            method: "POST",
            body: new URLSearchParams({
              image_url:    post.imageUrl,
              caption:      post.content || "",
              access_token: accessToken,
            }),
          }
        );
        const mediaJson = await mediaRes.json();
        if (mediaJson.error) throw new Error(mediaJson.error.message);

        // b) Publish that container
        const publishRes = await fetch(
          `${GRAPH_API}/${pageId}/media_publish`,
          {
            method: "POST",
            body: new URLSearchParams({
              creation_id:  String(mediaJson.id),
              access_token: accessToken,
            }),
          }
        );
        const publishJson = await publishRes.json();
        if (publishJson.error) throw new Error(publishJson.error.message);

        // c) Mark post as published (no igPostId stored)
        await prisma.post.update({
          where: { id: post.id },
          data:  { published: true },
        });

        results.push({
          postId:  post.id,
          pageId:  pageId,
          success: true,
        });
      } catch (err: any) {
        results.push({
          postId:  post.id,
          pageId:  pageId,
          success: false,
          error:   err.message,
        });
      }
    }
  }

  // 5. Return summary
  return NextResponse.json({ results });
}