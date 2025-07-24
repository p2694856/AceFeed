import fetch from 'cross-fetch';

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY!;
if (!UNSPLASH_KEY) {
  throw new Error('Set UNSPLASH_ACCESS_KEY in .env');
}

/**
 * Return one random landscape image URL matching the query, or null.
 */
export async function fetchUnsplashImage(
  query: string
): Promise<string | null> {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('client_id', UNSPLASH_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data.urls?.regular ?? null;
}