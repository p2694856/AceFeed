
import express, { Request, Response } from 'express'
import { getFeed } from './bluesky'
import dotenv from 'dotenv'
import cors from 'cors'
import { spawn } from "child_process"
import path from "path"

const app = express()
const PORT = process.env.PORT || 3001
app.use(cors())

app.use(express.json()) 
app.get('/api/feed', async (_req: Request, res: Response) => {
  try {
    const feed = await getFeed()
    res.json(feed)
  } catch (err) {
    console.error('Bluesky fetch error:', err)
    res.status(500).json({ error: 'Unable to fetch feed' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})



app.post('/api/engagement', (req, res) => {
  const { postId, duration } = req.body
  console.log(`Post ${postId} viewed for ${duration}ms`)
  res.status(200).json({ success: true })
})

app.post('/api/like', (req, res) => {
  const { postId } = req.body
  console.log(`Post ${postId} liked`)
  res.status(200).json({ success: true })
})

app.post('/api/personalize', async (req, res) => {
  const { text, action } = req.body

  // TODO: Integrate LLM here
  let responseText = `Performed "${action}" on: ${text}`

  res.json({ result: responseText })
})

app.post("/api/classify", (req, res) => {
  const { text, labels } = req.body
  const py = spawn(
    "python",
    [path.join(__dirname, "../classify.py")]
  )

  let output = ""
  py.stdout.on("data", chunk => (output += chunk.toString()))
  py.stderr.on("data", err => console.error("Classifier error:", err.toString()))

  py.on("close", code => {
    if (code !== 0) {
      return res.status(500).json({ error: "Classification failed" })
    }
    try {
      const result = JSON.parse(output)
      return res.json(result)
    } catch {
      return res.status(500).json({ error: "Invalid classifier response" })
    }
  })

  // Send payload to Python stdin
  py.stdin.write(JSON.stringify({ text, labels }))
  py.stdin.end()
})
