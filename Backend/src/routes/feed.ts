// backend/src/routes/feed.ts

import express, { Request, Response } from 'express';
import { getSession, fetchFollowedPosts } from '../services/bluesky';
import { transformPostsLLM } from '../services/llm';

const router = express.Router();
router.use(express.json());

router.post('/', async (req: Request, res: Response) => {
  const { style } = req.body as { style?: string };
  if (typeof style !== 'string' || style.trim() === '') {
    return res.status(400).json({ error: 'Missing "style" in request body' });
  }

  try {

    const { accessJwt, did } = await getSession();


    const posts = await fetchFollowedPosts(did, accessJwt);

   
    const enriched = await transformPostsLLM(style, posts);

    return res.json({ enriched });
  } catch (err: any) {
    console.error('❌ /api/enrich-feed error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal server error' });
  }
});

export default router; 