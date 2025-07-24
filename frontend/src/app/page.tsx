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
  const [layout, setLayout] = useState<'stacked' | 'gallery' | 'split'>('split');

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
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold item-center">Bluesky Feed Enricher</h1>

        <div className="flex gap-3 items-center">
        <span className="font-semibold text-sm">Layout:</span>
        {['stacked', 'gallery', 'split'].map((mode) => (
          <button
            key={mode}
            onClick={() => setLayout(mode as any)}
            className={`px-3 py-1 rounded border ${layout === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            {mode}
      </button>
        ))}
      </div>

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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow space-y-3">
            {/* Attachments */}
            {item.postImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Post"
                className="rounded w-full"
              />
            ))}
            {!item.postImages.length && item.generatedImageUrl && (
              <img
                src={item.generatedImageUrl}
                alt={item.imagePrompt}
                className="rounded w-full opacity-90"
              />
            )}
            {item.imagePrompt && (
              <p className="text-sm italic text-gray-500">🖼️ Concept: {item.imagePrompt}</p>
            )}
            {/* Captions */}
            <p><strong>📝 Original:</strong> {item.text}</p>
            <p><strong>✨ Summary:</strong> {item.summary}</p>
          </div>
        ))}
      </div>
    </main>
  );
}