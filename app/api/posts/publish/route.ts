// app/api/posts/publish/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN!;
const GRAPH_API       = "https://graph.facebook.com/v23.0";

export async function POST(req: Request) {
  // 1. Authenticate internal call
  const token = req.headers.get("x-internal-token");
  if (token !== INTERNAL_TOKEN) {
    return NextResponse.json(
      { error: "Forbidden – invalid internal token" },
      { status: 403 }
    );
  }

  // 2. Fetch all unpublished posts created in the last 10 minutes
const cutoff = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

const posts = await prisma.post.findMany({
  where: {
    published: false,
    createdAt: {
      gte: cutoff,
    },
  },
  select: {
    id: true,
    content: true,
    imageUrl: true,
    createdAt: true,
  },
});


  if (posts.length === 0) {
    return NextResponse.json({
      results: [],
      published: [],
      failed: [],
      message: "No new posts to publish",
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Load all proxy assignments
  const assignments = await prisma.proxyAssignment.findMany({
    include: { proxy: true },
  });

  const results: Array<{
  postId: number;
  pageId: string;
  success: boolean;
  error?: string;
  content?: string;
  imageUrl?: string;
  createdAt?: string;
}> = [];

  // 4. Publish loop
  for (const post of posts) {
    for (const { proxy } of assignments) {
      const pageId      = proxy.igBusinessId ?? proxy.fbPageId;
      const accessToken = proxy.accessToken;

      try {
        // a) Create media container
        const mediaRes = await fetch(`${GRAPH_API}/${pageId}/media`, {
          method: "POST",
          body: new URLSearchParams({
            image_url:    post.imageUrl,
            caption:      post.content || "",
            access_token: accessToken,
          }),
        });
        const mediaJson = await mediaRes.json();
        if (mediaJson.error) throw new Error(mediaJson.error.message);

        // b) Publish that container
        const publishRes = await fetch(`${GRAPH_API}/${pageId}/media_publish`, {
          method: "POST",
          body: new URLSearchParams({
            creation_id:  String(mediaJson.id),
            access_token: accessToken,
          }),
        });
        const publishJson = await publishRes.json();
        if (publishJson.error) throw new Error(publishJson.error.message);

        // c) Mark post as published
        await prisma.post.update({
          where: { id: post.id },
          data:  { published: true },
        });

        results.push({
          postId:   post.id,
          pageId,
          success:  true,
          content:  post.content ?? undefined,
          imageUrl: post.imageUrl,
        });
      } catch (err: any) {
        results.push({
          postId:   post.id,
          pageId,
          success:  false,
          error:    err.message,
          content:  post.content ?? undefined,
          imageUrl: post.imageUrl,
        });
      }
    }
  }

  // 5. Return summary
  const published = results.filter(r => r.success).map(r => r.postId);
  const failed    = results.filter(r => !r.success).map(r => ({
    postId: r.postId,
    pageId: r.pageId,
    error:  r.error,
  }));

  return NextResponse.json({
    results,
    published,
    failed,
    message: `Published ${published.length} post(s), ${failed.length} failed`,
    timestamp: new Date().toISOString(),
  });
}