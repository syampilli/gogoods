const RATE_CARD = {
  bike:  22,   // ₹20–25 range, avg ₹22/km
  van:   77,   // ₹75–80 range, avg ₹77/km
  heavy: 150   // ₹150/km
};

const BASE_FARE = {
  bike:  30,
  van:   100,
  heavy: 200
};

function calculateFare(distanceKm, vehicleType) {
  const rate = RATE_CARD[vehicleType] || 22;
  const base = BASE_FARE[vehicleType] || 30;
  return Math.round(base + (distanceKm * rate));
}

module.exports = { calculateFare, RATE_CARD, BASE_FARE };