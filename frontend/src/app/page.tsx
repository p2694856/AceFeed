// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

type EnrichedPost = {
  text: string;
  postImages: string[];
  summary: string;
  imagePrompt?: string;
  generatedImageUrl?: string;
};

export default function Page() {

  const searchParams = useSearchParams();
  const initialStyle = searchParams.get('style') ?? '';

  // 2) Local state
  const [style, setStyle] = useState(initialStyle);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStyle) {
      fetchFeed(initialStyle);
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4) Fetch helper
  async function fetchFeed(currentStyle: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:3001/api/enrich-feed',
        { style: currentStyle }
      );
      setPosts(res.data.enriched);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Bluesky Feed Enricher</h1>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder='Style (e.g. "friendly newsletter")'
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
        <button
          onClick={() => fetchFeed(style)}
          disabled={loading || !style.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Enriching…' : 'Enrich'}
        </button>
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="mt-6 space-y-6">
        {posts.map((item, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-3 shadow"
          >
            {/* Bluesky’s own attachments */}
            {item.postImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Post attachment"
                className="rounded w-full mb-2"
              />
            ))}

            {/* Generated or fallback image */}
            {!item.postImages.length && item.generatedImageUrl && (
              <img
                src={item.generatedImageUrl}
                alt={item.imagePrompt}
                className="rounded w-full opacity-80 mb-2"
              />
            )}

            <p>
              <strong>📝 Original:</strong> {item.text}
            </p>
            <p>
              <strong>✨ Summary:</strong> {item.summary}
            </p>
            <p>
              <strong>🖼️ Concept:</strong> {item.imagePrompt}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}