const express  = require('express');
const router   = express.Router();
const Message  = require('../models/Message');
const auth     = require('../middleware/auth');

// Get messages for an order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ orderId: req.params.orderId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a message
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, text, senderName, senderRole } = req.body;
    const message = await Message.create({
      orderId, text,
      sender: req.user.id,
      senderName, senderRole
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;