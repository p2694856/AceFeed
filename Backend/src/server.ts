import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import feedRouter from './routes/feed';

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/api/enrich-feed', feedRouter);

app.listen(3001, () =>
  console.log('API running on http://localhost:3001')
);