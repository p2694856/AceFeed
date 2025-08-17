// app/api/posts/generate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN!;

// Number of random images to pull per query
const IMG_COUNT = 4;
    
/**
 * Fetch a batch of random Unsplash images based on a keyword,
 * then pick one URL at random.
 */
async function fetchRandomImage(keyword: string): Promise<string | null> {
  const encoded = encodeURIComponent(keyword);
  const url = `https://api.unsplash.com/photos/random` +
              `?query=${encoded}` +
              `&count=${IMG_COUNT}` +
              `&client_id=${UNSPLASH_ACCESS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Unsplash batch fetch failed:", res.status, await res.text());
    return null;
  }

  const results = await res.json();  // this will be an array
  if (!Array.isArray(results) || results.length === 0) {
    console.warn("No Unsplash results for query:", keyword);
    return null;
  }

  // Pick one of the returned images at random
  const pick = results[Math.floor(Math.random() * results.length)];
  return pick.urls?.regular ?? null;
}

/**
 * Generate a short, engaging caption via OpenRouter
 */
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
          content: `Write a short, engaging social-media post titled "${title}".\n` +
                   `Content: ${content} and at the end exclaim that the post was AI generated, ` +
                   `refrain from using more than 1 emoji and do not start with an emoji`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Caption generation failed:", res.status, await res.text());
    return "";
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function GET(request: Request) {
  // Internal auth
  const token = request.headers.get("x-internal-token");
  if (token !== INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all topics
  const topics = await prisma.topic.findMany();

  // For each topic: generate caption, then fetch a random image using that caption
  const creations = topics.map((topic) =>
    (async () => {
      const seedContent = `Insights and news about ${topic.name}.`;
      const caption = await generateCaption(topic.name, seedContent);

      const searchTerm = caption || topic.name;
      const imageUrl = await fetchRandomImage(searchTerm);

      return prisma.post.create({
        data: {
          title: topic.name,
          content: caption,
          topicId: topic.id,
          published: true,
          imageUrl: imageUrl || "",
        },
      });
    })()
  );

  const posts = await Promise.all(creations);
  return NextResponse.json({ created: posts.length });
}