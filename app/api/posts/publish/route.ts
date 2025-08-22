// app/api/posts/publish/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Your secrets from .env
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN!;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;

export async function POST(req: Request) {
  // 1. Authenticate the request from your GitHub Action
  if (req.headers.get("x-internal-token") !== INTERNAL_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Find all recently created, unpublished posts
  const recentUnpublished = await prisma.post.findMany({
    where: { published: false },
  });

  if (recentUnpublished.length === 0) {
    return NextResponse.json({ message: "No new posts to publish." });
  }

  const publishTasks = [];

  // 3. For each post, find the right users and trigger the webhook
  for (const post of recentUnpublished) {
    // Find all UserTopic entries for this post's topic
    const subscriptions = await prisma.userTopic.findMany({
      where: { topicId: post.topicId },
      include: {
        // Include the user and their proxy assignment details
        user: {
          include: {
            proxyAssignments: {
              include: {
                proxy: true, // This gets the ProxyAccount with the tokens
              },
            },
          },
        },
      },
    });

    // 4. For each subscription, create a task to call the Make.com webhook
    for (const sub of subscriptions) {
      // A user might have multiple proxy assignments, though usually it's one.
      for (const assignment of sub.user.proxyAssignments) {
        // This is the data we'll send to Make.com
        const payload = {
          imageUrl: post.imageUrl,
          caption: post.content,
          igBusinessId: assignment.proxy.igBusinessId,
          accessToken: assignment.proxy.accessToken, // Pass the token directly
        };

        // Add the fetch call to our list of tasks to run
        publishTasks.push(
          fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        );
      }
    }
  }
  
  // 5. Run all the webhook triggers in parallel
  await Promise.all(publishTasks);

  // 6. Mark all the posts we've processed as "published"
  await prisma.post.updateMany({
    where: {
      id: {
        in: recentUnpublished.map((p) => p.id),
      },
    },
    data: {
      published: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Processed ${recentUnpublished.length} posts.`,
  });
}