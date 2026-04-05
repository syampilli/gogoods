const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  type:          { type: String, enum: ['percentage','flat'], required: true },
  value:         { type: Number, required: true }, // % or ₹ amount
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number },                 // cap for % discounts
  usageLimit:    { type: Number, default: 100 },
  usedCount:     { type: Number, default: 0 },
  validFrom:     { type: Date, default: Date.now },
  validTill:     { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  usedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoSchema);