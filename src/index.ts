import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database first
await initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
import kidsRouter from './api/kids.js';
import choresRouter from './api/chores.js';
import screenTimeRouter from './api/screen-time.js';

app.use('/api/kids', kidsRouter);
app.use('/api/chores', choresRouter);
app.use('/api/screen-time', screenTimeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Stop The Rot server running on http://localhost:${PORT}`);
});
