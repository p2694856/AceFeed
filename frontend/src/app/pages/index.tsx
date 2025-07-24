import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [style, setStyle] = useState('bullet-point summary');
  const [loading, setLoading] = useState(false);
  const [enriched, setEnriched] = useState('');

  const fetchEnrichedFeed = async () => {
    setLoading(true);
    setEnriched('');
    try {
      const res = await axios.post('http://localhost:3001/api/enrich-feed', {
        style,
      });
      setEnriched(res.data.enriched);
    } catch (err) {
      console.error('❌ Failed to fetch enriched feed:', err);
      setEnriched('Error fetching feed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Bluesky Feed Enricher</h1>
      <input
        className="border px-3 py-2 w-full"
        placeholder='Style (e.g. "friendly newsletter")'
        value={style}
        onChange={(e) => setStyle(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={fetchEnrichedFeed}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Enrich Feed'}
      </button>
      {enriched && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{enriched}</pre>
      )}
    </main>
  );
}