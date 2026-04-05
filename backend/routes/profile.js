const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Order   = require('../models/Order');
const auth    = require('../middleware/auth');
const bcrypt  = require('bcryptjs');

// GET profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, address, shopName,
            vehicleNumber, profilePhoto } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, shopName, vehicleNumber, profilePhoto },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE PASSWORD
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE AVAILABILITY (driver only)
router.put('/availability', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isAvailable = !user.isAvailable;
    await user.save();
    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET driver public profile (for vendor to see)
router.get('/driver/:id', auth, async (req, res) => {
  try {
    const driver = await User.findById(req.params.id)
      .select('name phone vehicle vehicleNumber profilePhoto isAvailable');

    const orders = await Order.find({
      driver: req.params.id,
      status: 'delivered'
    });

    const ratings   = orders.filter(o => o.rating);
    const avgRating = ratings.length
      ? (ratings.reduce((s,o) => s + o.rating, 0) / ratings.length).toFixed(1)
      : 'N/A';

    res.json({
      ...driver.toObject(),
      totalDeliveries: orders.length,
      avgRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET earnings breakdown (driver)
router.get('/earnings', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      driver: req.user.id,
      status: 'delivered'
    }).sort({ createdAt: -1 });

    const now = new Date();

    // Today
    const todayStart = new Date(now.setHours(0,0,0,0));
    const today = orders
      .filter(o => new Date(o.createdAt) >= todayStart)
      .reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0,0,0,0);
    const week = orders
      .filter(o => new Date(o.createdAt) >= weekStart)
      .reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = orders
      .filter(o => new Date(o.createdAt) >= monthStart)
      .reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);

    // Total
    const total = orders.reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);

    // Per day last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0,0,0,0));
      const dayEnd   = new Date(d.setHours(23,59,59,999));
      const earned   = orders
        .filter(o =>
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) <= dayEnd
        )
        .reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);
      last7.push({
        date: dayStart.toLocaleDateString('en-IN',{ weekday:'short', day:'numeric' }),
        earned,
        deliveries: orders.filter(o =>
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) <= dayEnd
        ).length
      });
    }

    res.json({ today, week, month, total, last7, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;