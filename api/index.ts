// Vercel Serverless Function Entrypoint for BloodBridge
import express from 'express';
import cors from 'cors';
import { apiRouter } from '../server/routes/api.js';
import { initDatabase } from '../server/db/database.js';
import { seedDatabase } from '../server/db/seed.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database in /tmp (or local) on cold start
try {
  initDatabase();
  seedDatabase();
} catch (err) {
  console.error('[Vercel Serverless] Database init warning:', err);
}

// Mount API routes
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
