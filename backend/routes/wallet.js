const express = require('express');
const router  = express.Router();
const Wallet  = require('../models/Wallet');
const auth    = require('../middleware/auth');

// Get or create wallet
async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });
  return wallet;
}

// GET wallet
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD money (mock — real app లో payment gateway)
router.post('/add', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });
    if (amount > 50000)
      return res.status(400).json({ message: 'Max ₹50,000 per transaction' });

    const wallet = await getOrCreateWallet(req.user.id);
    wallet.balance += amount;
    wallet.transactions.unshift({
      type:        'credit',
      amount,
      description: 'Money added to wallet',
      balance:     wallet.balance,
    });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PAY via wallet (called when order is placed)
router.post('/pay', auth, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;
    const wallet = await getOrCreateWallet(req.user.id);

    if (wallet.balance < amount)
      return res.status(400).json({ message: 'Insufficient wallet balance' });

    wallet.balance -= amount;
    wallet.transactions.unshift({
      type: 'debit',
      amount,
      description: description || 'Order payment',
      orderId,
      balance: wallet.balance,
    });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREDIT driver earnings (called when order delivered)
router.post('/credit', auth, async (req, res) => {
  try {
    const { userId, amount, orderId, description } = req.body;
    const wallet = await getOrCreateWallet(userId);

    wallet.balance += amount;
    wallet.transactions.unshift({
      type: 'credit',
      amount,
      description: description || 'Delivery earnings',
      orderId,
      balance: wallet.balance,
    });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;