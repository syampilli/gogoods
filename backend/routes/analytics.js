const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const allOrders = await Order.find().populate('vendor driver','name role');

    // Orders per day (last 7 days)
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0,0,0,0));
      const dayEnd   = new Date(date.setHours(23,59,59,999));
      const count = allOrders.filter(o =>
        new Date(o.createdAt) >= dayStart &&
        new Date(o.createdAt) <= dayEnd
      ).length;
      last7.push({
        date: dayStart.toLocaleDateString('en-IN',{ weekday:'short', day:'numeric' }),
        orders: count
      });
    }

    // Revenue per day
    const revenue7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0,0,0,0));
      const dayEnd   = new Date(date.setHours(23,59,59,999));
      const rev = allOrders
        .filter(o =>
          o.status === 'delivered' &&
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) <= dayEnd
        )
        .reduce((s, o) => s + (o.fare || 0), 0);
      revenue7.push({
        date: dayStart.toLocaleDateString('en-IN',{ weekday:'short', day:'numeric' }),
        revenue: rev
      });
    }

    // Vehicle type breakdown
    const vehicleBreakdown = ['bike','van','heavy'].map(v => ({
      vehicle: v,
      count: allOrders.filter(o => o.vehicleType === v).length,
      revenue: allOrders
        .filter(o => o.vehicleType === v && o.status === 'delivered')
        .reduce((s,o) => s + (o.fare||0), 0)
    }));

    // Status breakdown
    const statusBreakdown = ['pending','accepted','picked_up','in_transit','delivered','cancelled']
      .map(s => ({
        status: s,
        count: allOrders.filter(o => o.status === s).length
      }));

    // Summary stats
    const totalRevenue  = allOrders
      .filter(o => o.status === 'delivered')
      .reduce((s,o) => s + (o.fare||0), 0);
    const totalVendors  = await User.countDocuments({ role:'vendor' });
    const totalDrivers  = await User.countDocuments({ role:'driver' });
    const avgFare       = allOrders.length
      ? Math.round(allOrders.reduce((s,o) => s + (o.fare||0), 0) / allOrders.length)
      : 0;

    res.json({
      summary: {
        totalOrders:   allOrders.length,
        totalRevenue,
        totalVendors,
        totalDrivers,
        deliveredCount: allOrders.filter(o => o.status==='delivered').length,
        avgFare,
      },
      ordersPerDay:    last7,
      revenuePerDay:   revenue7,
      vehicleBreakdown,
      statusBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vendor-specific analytics
router.get('/vendor', auth, async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user.id });
    const delivered = orders.filter(o => o.status === 'delivered');
    const totalSpent = delivered.reduce((s,o) => s + (o.fare||0), 0);
    const avgRating  = delivered.filter(o=>o.rating).length
      ? (delivered.reduce((s,o) => s+(o.rating||0),0) /
         delivered.filter(o=>o.rating).length).toFixed(1)
      : 'N/A';

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0,0,0,0));
      const dayEnd   = new Date(date.setHours(23,59,59,999));
      last7.push({
        date: dayStart.toLocaleDateString('en-IN',{ weekday:'short', day:'numeric' }),
        orders: orders.filter(o =>
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) <= dayEnd
        ).length,
        spent: orders
          .filter(o =>
            o.status === 'delivered' &&
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) <= dayEnd
          )
          .reduce((s,o) => s+(o.fare||0),0)
      });
    }

    res.json({
      summary: {
        totalOrders:   orders.length,
        delivered:     delivered.length,
        totalSpent,
        avgRating,
        pending:       orders.filter(o=>o.status==='pending').length,
      },
      last7
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Driver-specific analytics
router.get('/driver', auth, async (req, res) => {
  try {
    const orders   = await Order.find({ driver: req.user.id });
    const delivered = orders.filter(o => o.status === 'delivered');
    const earnings  = delivered.reduce((s,o) => s+(o.fare||0),0);
    const avgRating = delivered.filter(o=>o.rating).length
      ? (delivered.reduce((s,o) => s+(o.rating||0),0) /
         delivered.filter(o=>o.rating).length).toFixed(1)
      : 'N/A';

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0,0,0,0));
      const dayEnd   = new Date(date.setHours(23,59,59,999));
      last7.push({
        date: dayStart.toLocaleDateString('en-IN',{ weekday:'short', day:'numeric' }),
        deliveries: delivered.filter(o =>
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) <= dayEnd
        ).length,
        earned: delivered
          .filter(o =>
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) <= dayEnd
          )
          .reduce((s,o) => s+(o.fare||0),0)
      });
    }

    res.json({
      summary: { totalDeliveries: delivered.length, earnings, avgRating,
                 activeJobs: orders.filter(o=>
                   !['delivered','cancelled'].includes(o.status)).length },
      last7
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;