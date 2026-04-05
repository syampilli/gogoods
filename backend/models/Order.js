const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  vendor:           { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  driver:           { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  pickupAddress:    { type: String, required: true },
  deliveryAddress:  { type: String, required: true },
  goodsDescription: { type: String, required: true },
  distanceKm:       { type: Number, required: true },
  vehicleType:      { type: String, enum:['bike','van','heavy'] },
  fare:             { type: Number },
  tip:              { type: Number, default: 0 },
  goodsImageUrl:    { type: String },
  status: {
    type: String,
    enum: ['pending','accepted','picked_up','in_transit','delivered','cancelled'],
    default: 'pending'
  },
  rejectedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref:'User' }],
  cancelReason: { type: String },
  rating:       { type: Number, min:1, max:5 },
  review:       { type: String },
  pickupCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  dropCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);