
import express, { Request, Response } from 'express'
import { getFeed } from './bluesky'
import dotenv from 'dotenv'
import cors from 'cors'
app.use(cors())


const app = express()
const PORT = process.env.PORT || 3001

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