// app/api/posts/publish/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN!;
const GRAPH_API       = "https://graph.facebook.com/v23.0";

export async function POST(req: Request) {
  // 1. Authenticate
  const token = req.headers.get("x-internal-token");
  if (token !== INTERNAL_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Fetch posts WITHOUT any filters (debug)
  const allUnpublished = await prisma.post.findMany({
    where: { published: false },
    select: { id: true, content: true, imageUrl: true, createdAt: true },
  });

  console.log("DEBUG allUnpublished:", allUnpublished);

  // 3. Fetch fresh posts (with cutoff)
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const recentUnpublished = allUnpublished.filter(p => p.createdAt >= cutoff);

  console.log("DEBUG recentUnpublished:", recentUnpublished);

  // If still empty, short-circuit and return both for visibility
  if (recentUnpublished.length === 0) {
    return NextResponse.json({
      debug: {
        allUnpublished,
        recentUnpublished,
        cutoff: cutoff.toISOString(),
      },
      results: [],
      published: [],
      failed: [],
      message: "No new posts to publish – see debug section",
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Fetch assignments
  const assignments = await prisma.proxyAssignment.findMany({
    include: { proxy: true },
  });
  console.log("DEBUG assignments:", assignments);

  // 5. Proceed with your publish loop (unchanged)...
  const results = [];
  for (const post of recentUnpublished) {
    for (const { proxy } of assignments) {
      const pageId = proxy.igBusinessId ?? proxy.fbPageId;
      const token  = proxy.accessToken;
      try {
        const mediaJson = await (
          await fetch(`${GRAPH_API}/${pageId}/media`, {
            method: "POST",
            body: new URLSearchParams({
              image_url:    post.imageUrl,
              caption:      post.content ?? "",
              access_token: token,
            }),
          })
        ).json();
        if (mediaJson.error) throw new Error(mediaJson.error.message);

        const publishJson = await (
          await fetch(`${GRAPH_API}/${pageId}/media_publish`, {
            method: "POST",
            body: new URLSearchParams({
              creation_id:  String(mediaJson.id),
              access_token: token,
            }),
          })
        ).json();
        if (publishJson.error) throw new Error(publishJson.error.message);

        await prisma.post.update({
          where: { id: post.id },
          data: { published: true },
        });

        results.push({ postId: post.id, pageId, success: true });
      } catch (err: any) {
        results.push({ postId: post.id, pageId, success: false, error: err.message });
      }
    }
  }

  // 6. Summarize and return
  const published = results.filter(r => r.success).map(r => r.postId);
  const failed    = results.filter(r => !r.success).map(r => ({
    postId: r.postId,
    pageId: r.pageId,
    error:  r.error,
  }));

  return NextResponse.json({
    debug: {
      seedCutoff: cutoff.toISOString(),
      fetchedPosts: recentUnpublished.map(p => p.id),
      assignmentPages: assignments.map(a => a.proxy.fbPageId),
    },
    results,
    published,
    failed,
    message: `Published ${published.length} post(s), ${failed.length} failed`,
    timestamp: new Date().toISOString(),
  });
}