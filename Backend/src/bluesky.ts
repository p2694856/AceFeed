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
export async function getFeed(): Promise<
  AppBskyFeedGetTimeline.Response["data"]["feed"]
> {
  await ensureLogin()
  const res = await AGENT.app.bsky.feed.getTimeline({})
  return res.data.feed
}