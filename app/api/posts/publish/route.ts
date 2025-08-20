import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN!;
const GRAPH_API = "https://graph.facebook.com/v17.0";

export async function POST(req: Request) {
  // 1. Internal auth
  const token = req.headers.get("x-internal-token");
  if (token !== INTERNAL_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Fetch posts from last 6 hours
  const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: cutoff } },
    select: { id: true, content: true, imageUrl: true },
  });

  if (posts.length === 0) {
    return NextResponse.json({ results: [], message: "No new posts" });
  }

  // 3. Fetch all proxy-page assignments
  const assignments = await prisma.proxyAssignment.findMany({
    include: { proxy: true },
  });

  const results: Array<{
    postId: string;
    pageId: string;
    success: boolean;
    error?: string;
    igPostId?: string;
  }> = [];

  // 4. Loop each post × each page
  for (const post of posts) {
    for (const a of assignments) {
      try {
        // 4a. Create media container
        const mediaRes = await fetch(
          `${GRAPH_API}/${a.proxy.fbPageId}/media?access_token=${a.proxy.accessToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: post.imageUrl,
              caption: post.content,
            }),
          }
        );
        const mediaJson = await mediaRes.json();
        if (mediaJson.error) {
          throw new Error(mediaJson.error.message);
        }

        // 4b. Publish container
        const publishRes = await fetch(
          `${GRAPH_API}/${a.proxy.fbPageId}/media_publish?creation_id=${mediaJson.id}&access_token=${a.proxy.accessToken}`,
          { method: "POST" }
        );
        const publishJson = await publishRes.json();
        if (publishJson.error) {
          throw new Error(publishJson.error.message);
        }

        // Cast post.id and publishJson.id to string
        results.push({
          postId: String(post.id),
          pageId: String(a.proxy.fbPageId),
          success: true,
          igPostId: String(publishJson.id),
        });
      } catch (err: any) {
        results.push({
          postId: String(post.id),
          pageId: String(a.proxy.fbPageId),
          success: false,
          error: err.message,
        });
      }
    }
  }

  // 5. Delete consumed posts
  await prisma.post.deleteMany({
    where: { id: { in: posts.map((p) => p.id) } },
  });

  // 6. Return summary for GitHub logs
  return NextResponse.json({ results });
}