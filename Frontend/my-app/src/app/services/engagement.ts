export async function handleLike(postId: string, liked: boolean, timestamp: Date ,userId: string) {
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, liked, timestamp, userId })
  })
}

export async function logDuration(postId: string, duration: number, timestamp: Date) {
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/engagement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, duration, timestamp })
  })
}

export async function classifyPost(text: string, labels: string[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, labels }),
    }
  )
  if (!res.ok) throw new Error("Classification error")
  return res.json() as Promise<{
    labels: string[]
    scores: number[]
    sequence: string
  }>
}
