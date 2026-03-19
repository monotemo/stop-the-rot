import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { initDatabase } from '../../src/db/schema.js';
import kidsRouter from '../../src/api/kids.js';
import choresRouter from '../../src/api/chores.js';
import screenTimeRouter from '../../src/api/screen-time.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no DB needed
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Lazy DB init — runs once per container lifecycle
let dbReady: Promise<void> | null = null;

app.use((_req, _res, next) => {
  if (!dbReady) dbReady = initDatabase();
  dbReady.then(next).catch(next);
});

app.use('/api/kids', kidsRouter);
app.use('/api/chores', choresRouter);
app.use('/api/screen-time', screenTimeRouter);

export const handler = serverless(app);
