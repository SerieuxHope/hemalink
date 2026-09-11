// HemaLink Full-Stack Server
// Integrates Express API router with Vite SPA middleware on a unified port

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './routes/api.js';
import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

try {
  process.loadEnvFile?.();
} catch {
  // No .env file present or already loaded
}

async function startServer() {
  // 1. Initialize SQLite Database & Ensure Seed Data
  initDatabase();
  seedDatabase();

  // 2. Setup Express App
  const app = express();
  app.use(cors());
  app.use(express.json());

  // 3. Mount REST API
  app.use('/api', apiRouter);

  // 4. Client Integration (Vite Middleware in Dev / Static in Prod)
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..'),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Start Listener
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  HEMALINK: EMERGENCY BLOOD SHORTAGE PLATFORM`);
    console.log(`  HealthTech Clinical Transfusion Operations System`);
    console.log(`======================================================`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  Environment: ${isProd ? 'Production' : 'Development'}`);
    console.log(`  Seeded Donors: 123 | Blood Banks: 3 | Active Shortages: 1`);
    console.log(`  Demo Scenario: Critical O+ Shortage (12 req / 3 in stock)`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting HemaLink server:', err);
  process.exit(1);
});
