import express from 'express';
import { getCompostStock, getActiveOrders } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Matchmaking Engine (Requires MCD Role Authorization)
router.get('/', authenticateJWT, requireRole(['mcd']), async (req, res) => {
  try {
    const compostAvailable = await getCompostStock();
    const activeOrders = await getActiveOrders();

    const cropNeeds = {
      Wheat: { kgPerAcre: 150 },
      Rice: { kgPerAcre: 200 },
      Sugarcane: { kgPerAcre: 400 },
      Mustard: { kgPerAcre: 120 }
    };

    const optimizationList = activeOrders
      .filter(order => order.status === 'Processing')
      .map(order => {
        const perAcreNeed = cropNeeds[order.crop]?.kgPerAcre || 100;
        const estimatedAcres = Math.round(order.qty / perAcreNeed);
        const isUrgent = order.crop === 'Rice'; 

        return {
          orderId: order.id,
          farmer: order.farmer,
          village: order.village,
          crop: order.crop,
          requestedQty: order.qty,
          estimatedAcres,
          matchScore: isUrgent ? 95 : 75,
          priority: isUrgent ? 'HIGH (SOWING SEASON)' : 'MEDIUM'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      warehouseStockAvailable: compostAvailable,
      activeDemandMatch: optimizationList,
      recommendationSummary: `Matchmaking prioritized ${optimizationList.filter(o => o.priority.includes('HIGH')).length} sowing-season orders. Current compost stock is sufficient for ${Math.floor(compostAvailable / 150)} acres of wheat crop.`
    });
  } catch (err) {
    return res.status(500).json({ error: "Matchmaking execution failure: " + err.message });
  }
});

export default router;
