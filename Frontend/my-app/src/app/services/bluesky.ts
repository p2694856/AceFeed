
export type Post = {
  uri: string
  cid: string
  author: { handle: string; displayName?: string }
  record: { text: string; createdAt: string }
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export async function fetchFeed(): Promise<Post[]> {
  const res = await fetch(`${BASE}/api/feed`)
  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status}`)
  }
  return res.json()
}