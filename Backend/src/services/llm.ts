// backend/src/services/llm.ts

import OpenAI from 'openai';
import type { RawPost } from './bluesky';
import { fetchUnsplashImage } from './unsplash';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Set OPENROUTER_API_KEY in .env');
}

const routerClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export interface EnrichedPost {
  text: string;
  postImages: string[];
  summary: string;
  imagePrompt?: string;
  generatedImageUrl?: string;
}


function extractJson(text: string): string {

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

export async function transformPostsLLM(
  style: string,
  posts: RawPost[]
): Promise<EnrichedPost[]> {

  let prompt = `Rewrite and summarize these Bluesky posts in a "${style}" style.\n\n`;
  posts.forEach((p, i) => {
    prompt += `Post #${i + 1}: "${p.text}"\n`;
    prompt += p.postImages.length
      ? `This post has an image—no suggestion needed.\n\n`
      : `No image—please suggest an illustrative image concept.\n\n`;
  });
  prompt +=
    'Respond *only* with valid JSON array of objects:\n' +
    `[{"summary":"...","imagePrompt":"..."}, ...]`;


  const chat = await routerClient.chat.completions.create({
    model: 'deepseek/deepseek-chat-v3-0324:free',
    messages: [{ role: 'user', content: prompt }],
  });


  const raw = chat.choices[0]?.message?.content ?? '';

  const jsonText = extractJson(raw);


  let parsed: Array<{ summary: string; imagePrompt?: string }> = [];
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('Failed to parse LLM JSON:', err);
    console.error('→ raw text:', raw);
    console.error('→ extracted JSON:', jsonText);
  }

  return Promise.all(
    posts.map(async (p, i) => {
      const { summary = '', imagePrompt } = parsed[i] ?? {};
      let generatedImageUrl: string | undefined;

      if (p.postImages.length === 0 && imagePrompt) {
        generatedImageUrl = (await fetchUnsplashImage(imagePrompt)) ?? undefined;
      }

      return {
        text: p.text,
        postImages: p.postImages,
        summary,
        imagePrompt,
        generatedImageUrl,
      };
    })
  );
}