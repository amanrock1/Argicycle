import express from 'express';
import { createOrder, updateOrderStatus } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Submit Compost Booking Order (Requires Authentication - any authenticated user can book compost)
router.post('/', authenticateJWT, async (req, res) => {
  const { farmer, village, crop, qty } = req.body;

  if (!farmer || !village || !qty) {
    return res.status(400).json({ error: "Missing fields." });
  }

  const quantity = parseInt(qty);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number." });
  }

  const newOrder = {
    id: `AC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-GB'),
    farmer,
    village,
    crop,
    qty: quantity,
    price: quantity * 4,
    status: 'Processing'
  };

  try {
    const result = await createOrder(newOrder);
    console.log(`[ORDERS] Order created: ${newOrder.id} (${quantity} kg) by ${req.user.name}`);
    return res.json({ success: true, order: newOrder, currentStock: result.currentStock });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. Cycle Shipping Status (Requires MCD Role Authorization)
router.put('/:id/status', authenticateJWT, requireRole(['mcd']), async (req, res) => {
  const { id } = req.params;

  try {
    const updatedOrder = await updateOrderStatus(id, (currentStatus) => {
      if (currentStatus === 'Processing') return 'In Transit';
      if (currentStatus === 'In Transit') return 'Delivered';
      return 'Processing'; // cycle back to Processing if somehow already Delivered
    });

    console.log(`[ORDERS] Order ${id} status cycled by MCD User: ${req.user.name}`);
    return res.json({ success: true, order: updatedOrder });
  } catch (err) {
    const status = err.message === "Order not found." ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
});

export default router;
