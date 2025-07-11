import dotenv from 'dotenv'
dotenv.config()
import { AtpAgent , AppBskyFeedGetTimeline } from '@atproto/api'

dotenv.config()

const AGENT = new AtpAgent ({ service: 'https://bsky.social' })

async function ensureLogin(): Promise<void> {
  if (AGENT.session) return
  const handle = process.env.BSKY_HANDLE!
  const password = process.env.BSKY_PASSWORD!
  await AGENT.login({ identifier: handle, password })
}

/**
 * Fetch the public Bluesky timeline.
 * We use AppBskyFeedGetTimeline.Response to type the result.
 */
function extractPublisher(handle: string) {
  // Simple rule-based mapping
  if (handle.includes('bbc')) return 'BBC'
  if (handle.includes('reuters')) return 'Reuters'
  if (handle.includes('nytimes')) return 'New York Times'
  return 'Unknown'
}

function inferCategory(text: string): string {
  const lowered = text.toLowerCase()
  if (lowered.includes('election') || lowered.includes('government')) return 'Politics'
  if (lowered.includes('climate') || lowered.includes('environment')) return 'Climate'
  if (lowered.includes('ai') || lowered.includes('tech')) return 'Tech'
  return 'General'
}

export async function getFeed() {
  await ensureLogin()
  const res = await AGENT.app.bsky.feed.getTimeline({})
  const annotated = res.data.feed.map(post => ({
    ...post,
    publisher: extractPublisher(post.author.handle),
    category: inferCategory(post.record.text)
  }))
  return annotated
}