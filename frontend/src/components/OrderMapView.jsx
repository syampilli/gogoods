import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { X } from 'lucide-react';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
});

export default function OrderMapView({ order, onClose }) {
  const hasCoords =
    order?.pickupCoords?.lat &&
    order?.dropCoords?.lat;

  // Fallback — Hyderabad center
  const center = hasCoords
    ? [order.pickupCoords.lat, order.pickupCoords.lng]
    : [17.3850, 78.4867];

  const polyline = hasCoords
    ? [
        [order.pickupCoords.lat, order.pickupCoords.lng],
        [order.dropCoords.lat,   order.dropCoords.lng  ],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl
                      overflow-hidden shadow-2xl border border-gray-100
                      dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              🗺️ Delivery Route
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              #{order._id.slice(-8).toUpperCase()} · {order.distanceKm} km
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800
                       flex items-center justify-center text-gray-500
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Address summary */}
        <div className="px-5 py-3 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"/>
              <span className="text-gray-600 dark:text-gray-300 truncate font-medium">
                {order.pickupAddress}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"/>
              <span className="text-gray-600 dark:text-gray-300 truncate font-medium">
                {order.deliveryAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ height:'380px' }}>
          {hasCoords ? (
            <MapContainer
              center={center}
              zoom={12}
              style={{ height:'100%', width:'100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />

              {/* Pickup marker */}
              <Marker
                position={[order.pickupCoords.lat, order.pickupCoords.lng]}
                icon={pickupIcon}>
                <Popup>
                  <b>📦 Pickup</b><br/>
                  {order.pickupAddress}
                </Popup>
              </Marker>

              {/* Drop marker */}
              <Marker
                position={[order.dropCoords.lat, order.dropCoords.lng]}
                icon={dropIcon}>
                <Popup>
                  <b>🏁 Drop</b><br/>
                  {order.deliveryAddress}
                </Popup>
              </Marker>

              {/* Route line */}
              <Polyline
                positions={polyline}
                color="#3b82f6"
                weight={3}
                dashArray="8 4"
              />
            </MapContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center
                            bg-gray-50 dark:bg-gray-800">
              <p className="text-gray-400 text-sm mb-2">
                Map coordinates not available
              </p>
              <p className="text-gray-300 text-xs text-center px-4">
                This order was placed without map selection.
                Addresses are shown above.
              </p>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <span>📏 {order.distanceKm} km</span>
              <span>💰 ₹{order.fare}</span>
              <span>
                {order.vehicleType==='bike'?'🏍️':order.vehicleType==='van'?'🚐':'🚛'}
                {' '}{order.vehicleType}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
              ${order.status === 'delivered'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {order.status.replace(/_/g,' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}