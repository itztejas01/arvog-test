import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
