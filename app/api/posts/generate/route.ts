// app/api/posts/generate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Reuse your existing helpers:
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

async function fetchImage(keyword: string): Promise<string | null> {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${keyword}&client_id=${UNSPLASH_ACCESS_KEY}`
  );
  const json = await res.json();
  return json.results?.[0]?.urls?.regular ?? null;
}

async function generateCaption(title: string, content: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "user",
          content: `Write a short, engaging social-media post titled "${title}".\nContent: ${content}`,
        },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function GET(_request: Request) {
  // 1) Protect with an internal token
  const token = _request.headers.get("x-internal-token");
  if (token !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2) Fetch all topics
  const topics = await prisma.topic.findMany();

  // 3) For each topic, generate & store a post
  const creations = topics.map(async (topic) => {
    // a) Basic placeholder content (or pull from another source)
    const seedContent = `Insights and news about ${topic.name}.`;
    const generated = await generateCaption(topic.name, seedContent);
    const imageUrl = await fetchImage(topic.name);

    return prisma.post.create({
      data: {
        title: topic.name,         // or derive from `generated`
        content: generated,
        topicId: topic.id,
        published: true,
        imageUrl: imageUrl || "",  // make sure your schema allows empty string
      },
    });
  });

  const posts = await Promise.all(creations);
  return NextResponse.json({ created: posts.length });
}