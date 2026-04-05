const express      = require('express');
const router       = express.Router();
const Order        = require('../models/Order');
const User         = require('../models/User');
const auth         = require('../middleware/auth');
const Notification = require('../models/Notification');
const Wallet       = require('../models/Wallet');
const { calculateFare } = require('../utils/fareCalc');

async function notify(io, userId, title, message, type='order', orderId=null) {
  const notif = await Notification.create({
    userId, title, message, type,
    ...(orderId && { orderId })
  });
  io.to(userId.toString()).emit('notification', notif);
  return notif;
}

function emitOrderUpdate(io, order) {
  if (order.vendor) io.to(order.vendor.toString()).emit('order_updated', order);
  if (order.driver) io.to(order.driver.toString()).emit('order_updated', order);
}

// CREATE ORDER
router.post('/', auth, async (req, res) => {
  try {
    const {
      pickupAddress, deliveryAddress, goodsDescription,
      distanceKm, vehicleType, goodsImageUrl,
      fare: clientFare, pickupCoords, dropCoords
    } = req.body;

    const fare = clientFare || calculateFare(parseFloat(distanceKm), vehicleType);

    const order = await Order.create({
      vendor: req.user.id,
      pickupAddress, deliveryAddress, goodsDescription,
      distanceKm, vehicleType, fare,
      goodsImageUrl, pickupCoords, dropCoords
    });

    const io = req.app.get('io');

    await notify(io, req.user.id,
      '✅ Order placed!',
      `Your delivery for "${goodsDescription}" is live. Finding a driver...`,
      'order', order._id
    );

    const availableDrivers = await User.find({
      role:'driver', isAvailable:true, isBlocked:false
    }).select('_id');

    for (const driver of availableDrivers) {
      await notify(io, driver._id,
        '🔔 New delivery job!',
        `New ${vehicleType} job — ${distanceKm}km — ₹${fare}. Check available jobs!`,
        'order', order._id
      );
    }

    io.emit('new_order_available', order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ORDERS
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    const populate = 'name email phone vehicle vehicleNumber profilePhoto';

    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('vendor', `${populate} shopName`)
        .populate('driver', populate)
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'vendor') {
      orders = await Order.find({ vendor: req.user.id })
        .populate('driver', populate)
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ driver: req.user.id })
        .populate('vendor', `name phone shopName profilePhoto`)
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PENDING ORDERS FOR DRIVERS
router.get('/pending', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'pending',
      rejectedBy: { $nin: [req.user.id] }
    }).populate('vendor', 'name phone shopName profilePhoto');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FARE ESTIMATE
router.post('/estimate', auth, (req, res) => {
  const { distanceKm, vehicleType } = req.body;
  const fare = calculateFare(parseFloat(distanceKm), vehicleType);
  res.json({ fare, distanceKm, vehicleType });
});

// ACCEPT ORDER
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: req.user.id, status: 'accepted' },
      { new: true }
    )
    .populate('vendor', 'name phone shopName')
    .populate('driver', 'name phone vehicle vehicleNumber');

    const io     = req.app.get('io');
    const driver = await User.findById(req.user.id).select('name vehicle vehicleNumber');

    await notify(io, order.vendor._id,
      '🚗 Driver assigned!',
      `${driver.name} (${driver.vehicle} · ${driver.vehicleNumber}) accepted your order.`,
      'order', order._id
    );

    await notify(io, req.user.id,
      '✅ Job accepted!',
      `Head to pickup: ${order.pickupAddress}`,
      'order', order._id
    );

    emitOrderUpdate(io, order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REJECT ORDER
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { rejectedBy: req.user.id } },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STATUS
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    )
    .populate('vendor', 'name phone shopName')
    .populate('driver', 'name phone vehicle vehicleNumber');

    const io = req.app.get('io');

    const vendorMessages = {
      picked_up:  { title:'📦 Goods picked up!',  msg:'Your goods are picked up. Driver is on the way.' },
      in_transit: { title:'🚗 On the way!',         msg:'Your goods are in transit. Expected delivery soon.' },
      delivered:  { title:'✅ Delivered!',           msg:'Your goods have been delivered. Please rate the driver.' },
    };

    if (vendorMessages[status]) {
      await notify(io, order.vendor._id,
        vendorMessages[status].title,
        vendorMessages[status].msg,
        'order', order._id
      );
    }

    // Credit driver earnings on delivery
    if (status === 'delivered') {
      let driverWallet = await Wallet.findOne({ userId: req.user.id });
      if (!driverWallet) driverWallet = await Wallet.create({ userId: req.user.id, balance: 0 });

      driverWallet.balance += order.fare;
      driverWallet.transactions.unshift({
        type:        'credit',
        amount:      order.fare,
        description: `Delivery earnings — #${order._id.toString().slice(-6).toUpperCase()}`,
        orderId:     order._id,
        balance:     driverWallet.balance,
      });
      await driverWallet.save();
    }

    emitOrderUpdate(io, order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CANCEL ORDER
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message:'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ message:'Cannot cancel after driver accepted' });

    order.status       = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by vendor';
    await order.save();

    const io = req.app.get('io');
    emitOrderUpdate(io, order);

    if (order.driver) {
      await notify(io, order.driver,
        '❌ Order cancelled',
        'The vendor cancelled this order.',
        'order', order._id
      );
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RATE + TIP
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review, tip } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { rating, review, ...(tip && { tip }) },
      { new: true }
    ).populate('driver','name');

    const io = req.app.get('io');

    // Tip credit to driver wallet
    if (tip && tip > 0 && order.driver) {
      let driverWallet = await Wallet.findOne({ userId: order.driver._id });
      if (!driverWallet)
        driverWallet = await Wallet.create({ userId: order.driver._id, balance: 0 });

      driverWallet.balance += tip;
      driverWallet.transactions.unshift({
        type:        'credit',
        amount:      tip,
        description: `Tip received — #${order._id.toString().slice(-6).toUpperCase()}`,
        orderId:     order._id,
        balance:     driverWallet.balance,
      });
      await driverWallet.save();

      await notify(io, order.driver._id,
        '🎉 Tip received!',
        `You received a ₹${tip} tip from the vendor!`,
        'order', order._id
      );
    }

    if (order.driver) {
      await notify(io, order.driver._id,
        `⭐ New rating!`,
        `You received a ${rating}-star rating.`,
        'order', order._id
      );
    }

    emitOrderUpdate(io, order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;