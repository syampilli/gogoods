const express   = require('express');
const router    = express.Router();
const PromoCode = require('../models/PromoCode');
const Order     = require('../models/Order');
const auth      = require('../middleware/auth');

// Surge pricing logic
function getSurgeMultiplier() {
  const hour = new Date().getHours();
  // Peak hours: 8–10am, 12–2pm, 6–9pm
  const isPeak = (hour >= 8  && hour <= 10) ||
                 (hour >= 12 && hour <= 14) ||
                 (hour >= 18 && hour <= 21);
  return isPeak ? 1.3 : 1.0; // 30% surge during peak
}

// GET surge status
router.get('/surge', auth, (req, res) => {
  const multiplier = getSurgeMultiplier();
  const hour = new Date().getHours();
  res.json({
    multiplier,
    isSurge: multiplier > 1,
    message: multiplier > 1
      ? `⚡ Surge pricing active (${Math.round((multiplier-1)*100)}% extra) — High demand right now`
      : '✅ Normal pricing',
    currentHour: hour,
  });
});

// VALIDATE promo code
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promo)
      return res.status(404).json({ message: 'Invalid promo code' });
    if (new Date() > promo.validTill)
      return res.status(400).json({ message: 'Promo code expired' });
    if (promo.usedCount >= promo.usageLimit)
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    if (promo.usedBy.includes(req.user.id))
      return res.status(400).json({ message: 'You have already used this code' });
    if (orderValue < promo.minOrderValue)
      return res.status(400).json({
        message: `Minimum order value ₹${promo.minOrderValue} required`
      });

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.round(orderValue * promo.value / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.value;
    }

    res.json({
      valid: true,
      discount,
      finalAmount: Math.max(orderValue - discount, 0),
      message:     `🎉 ₹${discount} discount applied!`,
      promo: {
        code:  promo.code,
        type:  promo.type,
        value: promo.value,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// APPLY promo (mark as used)
router.post('/apply', auth, async (req, res) => {
  try {
    const { code } = req.body;
    await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $inc: { usedCount: 1 },
        $addToSet: { usedBy: req.user.id }
      }
    );
    res.json({ message: 'Promo applied successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin — create promo code
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });
    const promo = await PromoCode.create(req.body);
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin — get all promos
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;