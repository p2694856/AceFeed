// backend/src/services/vision.ts
import fetch from 'cross-fetch';

const HF_TOKEN = process.env.HF_INFERENCE_TOKEN;

if (!HF_TOKEN) {
  throw new Error('Missing HF_INFERENCE_TOKEN in .env!');
}

export async function captionImage(url: string): Promise<string | null> {
  const res = await fetch(
    'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: url }),
    }
  );

  const json = await res.json();
  return Array.isArray(json) && json[0]?.generated_text
    ? json[0].generated_text
    : null;
}