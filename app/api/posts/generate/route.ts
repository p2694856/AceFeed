// app/api/posts/generate/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY   = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY  = process.env.UNSPLASH_ACCESS_KEY!;
const INTERNAL_API_TOKEN   = process.env.INTERNAL_API_TOKEN!;
const IMG_COUNT            = 4; // images per Unsplash query
const OPENROUTER_ENDPOINT  = "https://openrouter.ai/api/v1/chat/completions";
const UNSPLASH_ENDPOINT    = "https://api.unsplash.com/photos/random";

/** Safe JSON parser for fetch responses */
async function safeExtractJson(res: Response, label: string) {
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch (err: any) {
    console.error(`❌ [${label}] Invalid JSON response:`, raw);
    return null;
  }
}

/** Fetch one random Unsplash image URL or null */
async function fetchRandomImage(keyword: string): Promise<string | null> {
  const url = `${UNSPLASH_ENDPOINT}` +
    `?query=${encodeURIComponent(keyword)}` +
    `&count=${IMG_COUNT}` +
    `&client_id=${UNSPLASH_ACCESS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error("Unsplash batch fetch failed:", res.status, text);
    return null;
  }

  const data = await safeExtractJson(res, "Unsplash");
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No Unsplash results for:", keyword);
    return null;
  }

  const pick = data[Math.floor(Math.random() * data.length)];
  return pick.urls?.regular ?? null;
}

/** Generate a short caption via OpenRouter, or empty string */
async function generateCaption(title: string, content: string): Promise<string> {
  const payload = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "user",
        content:
          `Write a short, engaging social-media post titled "${title}".\n` +
          `Content: ${content} and at the end exclaim that the post was AI generated, ` +
          `refrain from using more than 1 emoji and do not start with an emoji`,
      },
    ],
  };

  const res = await fetch(OPENROUTER_ENDPOINT, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Caption generation failed:", res.status, text);
    return "";
  }

  const data = await safeExtractJson(res, "OpenRouter");
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function POST(request: Request) {
  // 1. Raw-body logging + safe parse
  const rawBody = await request.text();
  console.log("DEBUG raw request body:", rawBody);

  let body: any = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch (err: any) {
    console.error("❌ Invalid JSON payload:", err.message);
    return NextResponse.json(
      { error: "Invalid JSON payload", details: rawBody },
      { status: 400 }
    );
  }

  // 2. Internal auth check
  const token = request.headers.get("x-internal-token");
  if (token !== INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Fetch all topics from DB
  const topics = await prisma.topic.findMany();
  console.log(`Found ${topics.length} topics.`);

  // 4. For each topic, generate caption + image + create post
  const creations = topics.map((topic) =>
    (async () => {
      const seedContent = `Insights and news about ${topic.name}.`;
      const caption     = await generateCaption(topic.name, seedContent);
      const searchTerm  = caption || topic.name;
      const imageUrl    = await fetchRandomImage(searchTerm);

      return prisma.post.create({
        data: {
          title:     topic.name,
          content:   caption,
          topicId:   topic.id,
          published: true,
          imageUrl:  imageUrl || "",
        },
      });
    })()
  );

  const posts = await Promise.all(creations);
  console.log(`✅ Created ${posts.length} posts.`);

  return NextResponse.json({ created: posts.length });
}