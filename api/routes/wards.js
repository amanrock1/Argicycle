import express from 'express';
import { logWardSegregation } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Log Ward Segregation Volumes (Requires MCD Role Authorization)
router.post('/log', authenticateJWT, requireRole(['mcd']), async (req, res) => {
  const { wardName, wetTons, dryTons } = req.body;

  if (!wardName || wetTons === undefined || dryTons === undefined) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const wet = parseFloat(wetTons);
  const dry = parseFloat(dryTons);

  if (isNaN(wet) || isNaN(dry) || wet < 0 || dry < 0) {
    return res.status(400).json({ error: "Waste quantities must be non-negative numbers." });
  }

  const total = wet + dry;
  if (total === 0) {
    return res.status(400).json({ error: "Total waste logged cannot be zero." });
  }

  const wetPercent = Math.round((wet / total) * 100);
  const dryPercent = 100 - wetPercent;
  const addedCompost = Math.round(wet * 120);

  const updatedWardStats = {
    wet: wetPercent,
    dry: dryPercent,
    dailyTons: Math.round(total),
    activeTrucks: Math.round(total / 3) || 5,
    efficiency: Math.min(100, Math.round(75 + (wetPercent * 0.25)))
  };

  try {
    const nextStock = await logWardSegregation(wardName, wet, dry, updatedWardStats, addedCompost);
    console.log(`[WARDS] Recorded segregation for ${wardName} by MCD user ${req.user.name}. Added stock: ${addedCompost} kg.`);
    return res.json({ success: true, ward: updatedWardStats, currentStock: nextStock });
  } catch (err) {
    return res.status(500).json({ error: "Error logging ward statistics: " + err.message });
  }
});

export default router;
