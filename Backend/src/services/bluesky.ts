// backend/src/services/bluesky.ts
import fetch from 'cross-fetch';

export interface RawPost {
  text: string;
  postImages: string[];
}

const API = process.env.BLUESKY_SERVICE!;
const USER = process.env.BLUESKY_USERNAME!;
const PASS = process.env.BLUESKY_PASSWORD!;

if (!API || !USER || !PASS) {
  throw new Error(
    'Missing BLUESKY_SERVICE, BLUESKY_USERNAME or BLUESKY_PASSWORD in .env'
  );
}

export async function getSession(): Promise<{
  accessJwt: string;
  did: string;
}> {
  const res = await fetch(`${API}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: USER, password: PASS }),
  });

  const payload = await res.json();
  if (!res.ok) {
    console.error('Bluesky login failed:', res.status, payload);
    throw new Error(`Login error: ${payload.error || res.status}`);
  }

  const session = (payload as any).data ?? (payload as any);
  const { accessJwt, did } = session;
  if (!accessJwt || !did) {
    console.error('Unexpected session payload:', payload);
    throw new Error('Missing accessJwt or did in login response');
  }

  return { accessJwt, did };
}


export async function fetchFollowedPosts(
  did: string,
  accessJwt: string
): Promise<RawPost[]> {
  const url = new URL(`${API}/xrpc/app.bsky.feed.getTimeline`);
  url.searchParams.set('feed', 'following');
  url.searchParams.set('author', did);
  url.searchParams.set('limit', '10');   // <- limit to 16 posts

  const res = await fetch(url.toString(), { 
    headers: { Authorization: `Bearer ${accessJwt}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('fetchFollowedPosts error:', res.status, text);
    throw new Error(`Timeline fetch failed: ${res.status}`);
  }

  const { feed } = await res.json();
  return (feed as any[]).map((item) => ({
    text: item.post.record.text as string,
    postImages:
      item.post.record.embed?.images?.map((img: any) => img.fullsize) ?? [],
  }));
}