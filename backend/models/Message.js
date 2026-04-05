const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['vendor','driver','admin'] },
  text:     { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);