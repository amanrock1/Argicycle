import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getSystemState, getFirebaseStatus } from './db.js';
import authRouter, { seedDefaultUsersHashed } from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import wardsRouter from './routes/wards.js';
import alertsRouter from './routes/alerts.js';
import matchmakingRouter from './routes/matchmaking.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed default accounts with hashed passwords
seedDefaultUsersHashed();

// Public route to fetch system state (used on landing page and dashboard panels)
app.get('/api/state', async (req, res) => {
  try {
    const state = await getSystemState();
    return res.json(state);
  } catch (err) {
    return res.status(500).json({ error: "System state load failure: " + err.message });
  }
});

// Mount modular sub-routers
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wards', wardsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/matchmaking', matchmakingRouter);

// Start server
app.listen(PORT, async () => {
  const useFirebase = await getFirebaseStatus();
  console.log(`=======================================================`);
  console.log(`  🌾 AGRICYCLE BACKEND RUNNING ON http://localhost:${PORT} 🌾`);
  console.log(`  🔄 Firebase Support: ${useFirebase ? "ENABLED (Production)" : "DISABLED (Fallback to JSON)"}`);
  console.log(`=======================================================`);
});

export default app;
