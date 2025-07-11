// src/app/page.tsx
'use client'
import { handleLike, logDuration } from './services/engagement'
import { useViewTime } from './contents/useViewTime'

import { useEffect, useState } from 'react'
import { fetchFeed, Post } from './services/bluesky'

export default function HomePage() {
  const [feed, setFeed] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string>("")

  async function handleSummarize(text: string) {
    const { labels, scores } = await classifyPost(text, [
      "Politics",
      "Technology",
      "Climate",
      "General",
    ])
    // Pick top label
    const idx = scores.indexOf(Math.max(...scores))
    setSummary(`Topic: ${labels[idx]} (${(scores[idx] * 100).toFixed(1)}%)`)
  }
    useEffect(() => {
    fetchFeed()
      .then(setFeed)
      .catch(err => setError(err.message))
  }, [])

  if (error) return <p className="p-4 text-red-500">Error: {error}</p>

  return (
    <main className="container mx-auto p-4">
      {feed.map(post => (
        <article key={post.cid} className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-bold">
            {post.author.displayName || post.author.handle}
          </h2>
          <p className="mt-2">{post.record.text}</p>
          <time className="text-gray-500 text-sm">
            {new Date(post.record.createdAt).toLocaleString()}
          </time>
          <button
            className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => handleLike(post.uri, false, new Date(), "demo-user")}
          >
          ❤️ Like
        </button>

        </article>
      ))}
    </main>
  )
}