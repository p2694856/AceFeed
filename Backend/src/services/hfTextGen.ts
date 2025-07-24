import fetch from 'cross-fetch';

const HF_TOKEN = process.env.HF_INFERENCE_TOKEN;
if (!HF_TOKEN) {
  throw new Error('Missing HF_INFERENCE_TOKEN in .env');
}
console.log('🔑 HF token loaded:', HF_TOKEN.slice(0, 6) + '…');

export async function hfTextGenerate(
  model: string,
  prompt: string,
  maxNewTokens = 512
): Promise<string> {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  console.log('🚀 Calling HF Inference URL:', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxNewTokens, do_sample: false },
    }),
  });

  console.log('⬅️ HF status:', res.status);
  const text = await res.text();
  if (!res.ok) {
    console.error('❌ HF response body:', text);
    throw new Error(`HF inference ${res.status}: ${text}`);
  }

  // parse the JSON array
  const json = JSON.parse(text) as Array<{ generated_text?: string }>;
  console.log('✅ HF generated_text:', json[0]?.generated_text?.slice(0, 80) + '…');
  return json[0]?.generated_text ?? '';
}