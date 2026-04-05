const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  phone:       { type: String, required: true },
  role:        { type: String, enum: ['vendor','driver','admin'], default: 'vendor' },
  profilePhoto:{ type: String },
  address:     { type: String },
  // Vendor fields
  shopName:    { type: String },
  // Driver fields
  vehicle:         { type: String },
  vehicleNumber:   { type: String },
  isAvailable:     { type: Boolean, default: true },
  isBlocked:       { type: Boolean, default: false },
  licenseUrl:      { type: String },
  licenseVerified: { type: Boolean, default: false },
  // Password reset
  resetOTP:       { type: String },
  resetOTPExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);