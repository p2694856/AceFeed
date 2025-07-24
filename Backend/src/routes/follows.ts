/*import express from 'express';
import { fetchFollowedPosts } from '../services/bluesky';

const router = express.Router();

// GET /api/follows/:did
router.get('/:did', async (req, res) => {
  const did = req.params.did;               // ← your DID comes from the URL here
  console.log('fetchFollowedPosts called with DID:', did);
  const posts = await fetchFollowedPosts(did);
  const followedDIDs = Array.from(
    new Set(posts.map(p => p.post.author.did))
  );
  res.json({ follows: followedDIDs });
});

export default router;*/