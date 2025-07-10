// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { fetchFeed, Post } from './services/bluesky'

export default function HomePage() {
  const [feed, setFeed] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

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
        </article>
      ))}
    </main>
  )
}