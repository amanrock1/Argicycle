import express from 'express';
import { broadcastAlert } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Broadcast Advisory Alert (Requires MCD Role Authorization)
router.post('/broadcast', authenticateJWT, requireRole(['mcd']), async (req, res) => {
  const { alertMessage } = req.body;

  if (!alertMessage || alertMessage.trim() === "") {
    return res.status(400).json({ error: "Empty advisory message." });
  }

  try {
    const updatedAlerts = await broadcastAlert(alertMessage);
    console.log(`[ALERTS] Advisory broadcasted: "${alertMessage}" by MCD user ${req.user.name}`);
    return res.json({ success: true, alerts: updatedAlerts });
  } catch (err) {
    return res.status(500).json({ error: "Error broadcasting advisory: " + err.message });
  }
});

export default router;
