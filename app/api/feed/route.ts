import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

// 🔍 Fetch Unsplash image
async function fetchImage(keyword: string): Promise<string | null> {
  const res = await fetch(`https://api.unsplash.com/search/photos?query=${keyword}&client_id=${UNSPLASH_ACCESS_KEY}`);
  const data = await res.json();
  return data.results?.[0]?.urls?.regular ?? null;
}

// Generate caption via OpenRouter
async function generateCaption(title: string, content: string | null): Promise<string | null> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [{
        role: 'user',
        content: `Write a short, engaging caption for this post:\nTitle: ${title}\nContent: ${content}`,
      }],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

//Main handler
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get user's subscribed topics
  const userTopics = await prisma.userTopic.findMany({
    where: { userId: session.user.id },
    select: { topicId: true },
  });
  const topicIds = userTopics.map(t => t.topicId);

  // Fetch posts for those topics
  const posts = await prisma.post.findMany({
    where: { topicId: { in: topicIds } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Enrich each post
  const enrichedPosts = await Promise.all(posts.map(async post => {
    const image = await fetchImage(post.title);
    const caption = await generateCaption(post.title, post.content);
    return { ...post, image, caption };
  }));

  return NextResponse.json(enrichedPosts);
}