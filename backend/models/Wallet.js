const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['credit','debit'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  balance:     { type: Number, required: true }, // balance after transaction
}, { timestamps: true });

const walletSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',
                  required: true, unique: true },
  balance:      { type: Number, default: 0 },
  transactions: [transactionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);