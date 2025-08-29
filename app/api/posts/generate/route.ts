// app/api/posts/generate/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY   = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY  = process.env.UNSPLASH_ACCESS_KEY!;
const INTERNAL_API_TOKEN   = process.env.INTERNAL_API_TOKEN!;
const OPENROUTER_ENDPOINT  = "https://openrouter.ai/api/v1/chat/completions";
const UNSPLASH_ENDPOINT    = "https://api.unsplash.com/search/photos";

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
// Fetch images
async function fetchFocusedImage(keyword: string): Promise<string | null> {
  const url =
    `${UNSPLASH_ENDPOINT}` +
    `?query=${encodeURIComponent(keyword)}` +
    `&per_page=1` + // We only need the single best result
    `&client_id=${UNSPLASH_ACCESS_KEY}`;

  const res  = await fetch(url);
  // The search endpoint returns an object with a 'results' array
  const data = await safeJson<{ results: any[] }>(res, "Unsplash");

  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    console.warn("⚠️ No Unsplash hits for:", keyword);
    return null;
  }
  
  // Return the URL of the first (most relevant) image
  const firstImage = data.results[0];
  return firstImage?.urls?.regular ?? null;
}

async function generateCaption(title: string, content: string): Promise<string> {
  const payload = {
    model:    "openai/gpt-4o",
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
  const creationPromises = topics.map(async (topic) => {
    const seed = `Insights and news about ${topic.name}.`;
    const caption = await generateCaption(topic.name, seed);
    
    // *** CHANGE 3: Use the new function with the more reliable topic name ***
    const image = await fetchFocusedImage(topic.name);

    if (image && caption) {
      return prisma.post.create({
        data: {
          title: topic.name,
          content: caption,
          topicId: topic.id,
          imageUrl: image,
        },
      });
    } else {
      console.warn(`Skipping post for topic "${topic.name}" due to missing image or caption.`);
      return null;
    }
  });

  // 3. Persist all valid posts at once
  const results = await Promise.all(creationPromises);
  const posts = results.filter(post => post !== null); 

  console.log(`✅ Generated ${posts.length} post(s). IDs:`, posts.map(p => p.id));

  // 4. Return count
  return NextResponse.json({ created: posts.length });
}