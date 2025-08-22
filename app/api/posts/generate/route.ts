// app/api/posts/generate/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY   = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY  = process.env.UNSPLASH_ACCESS_KEY!;
const INTERNAL_API_TOKEN   = process.env.INTERNAL_API_TOKEN!;
const IMG_COUNT            = 4;
const OPENROUTER_ENDPOINT  = "https://openrouter.ai/api/v1/chat/completions";
const UNSPLASH_ENDPOINT    = "https://api.unsplash.com/photos/random";

async function safeJson<T = any>(res: Response, label: string): Promise<T | null> {
  const txt = await res.text();
  if (!res.ok) {
    console.error(`❌ [${label}] HTTP ${res.status}`, txt);
    return null;
  }
  try {
    return JSON.parse(txt);
  } catch (e: any) {
    console.error(`❌ [${label}] Invalid JSON:`, txt);
    return null;
  }
}

async function fetchRandomImage(keyword: string): Promise<string | null> {
  const url =
    `${UNSPLASH_ENDPOINT}` +
    `?query=${encodeURIComponent(keyword)}` +
    `&count=${IMG_COUNT}` +
    `&client_id=${UNSPLASH_ACCESS_KEY}`;

  const res  = await fetch(url);
  const data = await safeJson<any[]>(res, "Unsplash");
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("⚠️ No Unsplash hits for:", keyword);
    return null;
  }
  const pick = data[Math.floor(Math.random() * data.length)];
  return pick?.urls?.regular ?? null;
}

async function generateCaption(title: string, content: string): Promise<string> {
  const payload = {
    model:    "openai/gpt-4o", // Using the best value model
    messages: [
      {
        role:    "user",
        content:
          `Write a short, engaging social-media post titled "${title}".\n` +
          `Content: ${content} and at the end exclaim that the post was AI generated, ` +
          `refrain from using more than 1 emoji and do not start with an emoji`,
      },
    ],
  };

  const res  = await fetch(OPENROUTER_ENDPOINT, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson<any>(res, "OpenRouter");
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function GET(request: Request) {
  // 1. Internal auth
  if (request.headers.get("x-internal-token") !== INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Build one post per topic in parallel
  const topics = await prisma.topic.findMany();
  const creations = topics.map((topic) =>
    (async () => {
      const seed    = `Insights and news about ${topic.name}.`;
      const caption = await generateCaption(topic.name, seed);
      const image   = await fetchRandomImage(caption || topic.name);

      // Return the promise to create the post
      return prisma.post.create({
        data: {
          title:     topic.name,
          content:   caption,
          topicId:   topic.id,
          imageUrl:  image || "",
        },
      });
    })()
  );

  // 3. Persist all posts at once
  const posts = await Promise.all(creations);
  console.log(`✅ Generated ${posts.length} post(s). IDs:`, posts.map(p => p.id));

  // 4. Return count
  return NextResponse.json({ created: posts.length });
}