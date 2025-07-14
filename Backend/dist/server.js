// src/server.ts
import express from 'express';
import { getFeed } from '../src/bluesky.ts';
const app = express();
const PORT = process.env.PORT || 4000;
app.get('/api/feed', async (_req, res) => {
    try {
        const feed = await getFeed();
        res.json(feed);
    }
    catch (err) {
        console.error('Bluesky fetch error:', err);
        res.status(500).json({ error: 'Unable to fetch feed' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
