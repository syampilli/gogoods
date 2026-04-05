import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, X, Check, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34],
});

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2)**2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function ClickHandler({ mode, onPickup, onDrop }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      if (mode === 'pickup') onPickup({ lat, lng, address });
      else                   onDrop({ lat, lng, address });
    }
  });
  return null;
}

export default function MapPicker({ onConfirm, onClose }) {
  const { t } = useTranslation();

  const [mode,   setMode]   = useState('pickup');
  const [pickup, setPickup] = useState(null);
  const [drop,   setDrop]   = useState(null);
  const [center, setCenter] = useState([17.3850, 78.4867]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const distance = pickup && drop
    ? calcDistance(pickup.lat, pickup.lng, drop.lat, drop.lng)
    : null;

  const handleConfirm = () => {
    if (!pickup || !drop) return;
    onConfirm({
      pickupAddress:   pickup.address,
      deliveryAddress: drop.address,
      distanceKm:      distance,
      pickupCoords:    { lat: pickup.lat, lng: pickup.lng },
      dropCoords:      { lat: drop.lat,   lng: drop.lng   },
    });
  };

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
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              📍 {t('map.title')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('map.subtitle')}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800
                       flex items-center justify-center text-gray-500
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 px-5 py-3">
          <button onClick={() => setMode('pickup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5
                        rounded-xl text-sm font-bold transition-all border-2
                        ${mode === 'pickup'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            <div className="w-3 h-3 rounded-full bg-green-500"/>
            {pickup ? `✓ ${t('map.pickupSet')}` : t('map.setPickup')}
          </button>
          <button onClick={() => setMode('drop')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5
                        rounded-xl text-sm font-bold transition-all border-2
                        ${mode === 'drop'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            <div className="w-3 h-3 rounded-full bg-red-500"/>
            {drop ? `✓ ${t('map.dropSet')}` : t('map.setDrop')}
          </button>
        </div>

        {/* Instruction */}
        <div className={`mx-5 mb-2 px-3 py-2 rounded-xl text-xs font-medium
          ${mode === 'pickup'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          👆 {t('map.instruction')}{' '}
          <b>{mode === 'pickup' ? t('map.setPickup') : t('map.setDrop')}</b>
        </div>

        {/* Map */}
        <div className="mx-5 mb-3 rounded-2xl overflow-hidden"
             style={{ height:'320px' }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height:'100%', width:'100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <ClickHandler
              mode={mode}
              onPickup={setPickup}
              onDrop={setDrop}
            />
            {pickup && (
              <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                <Popup>
                  <b>{t('map.setPickup')}</b><br/>
                  {pickup.address.slice(0, 80)}
                </Popup>
              </Marker>
            )}
            {drop && (
              <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
                <Popup>
                  <b>{t('map.setDrop')}</b><br/>
                  {drop.address.slice(0, 80)}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Selected addresses */}
        {(pickup || drop) && (
          <div className="mx-5 mb-3 space-y-2">
            {pickup && (
              <div className="flex items-start gap-2 p-3 bg-green-50
                              dark:bg-green-900/20 rounded-xl border
                              border-green-200 dark:border-green-800">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500
                                flex-shrink-0 mt-1"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-700
                                dark:text-green-400">
                    {t('map.setPickup')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {pickup.address}
                  </p>
                </div>
                <button onClick={() => setPickup(null)}
                  className="text-green-500 hover:text-green-700 flex-shrink-0">
                  <X size={14}/>
                </button>
              </div>
            )}

            {drop && (
              <div className="flex items-start gap-2 p-3 bg-red-50
                              dark:bg-red-900/20 rounded-xl border
                              border-red-200 dark:border-red-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500
                                flex-shrink-0 mt-1"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">
                    {t('map.setDrop')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {drop.address}
                  </p>
                </div>
                <button onClick={() => setDrop(null)}
                  className="text-red-500 hover:text-red-700 flex-shrink-0">
                  <X size={14}/>
                </button>
              </div>
            )}

            {distance && (
              <div className="flex items-center justify-center gap-2 p-2
                              bg-blue-50 dark:bg-blue-900/20 rounded-xl
                              border border-blue-200 dark:border-blue-800">
                <Navigation size={14} className="text-blue-600"/>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  {t('map.distance')}: {distance} km
                </span>
              </div>
            )}
          </div>
        )}

        {/* Confirm button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleConfirm}
            disabled={!pickup || !drop}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700
                       disabled:bg-gray-300 dark:disabled:bg-gray-700
                       disabled:cursor-not-allowed text-white font-bold
                       rounded-xl transition-all flex items-center
                       justify-center gap-2 text-sm">
            <Check size={16}/>
            {t('map.confirm')}
            {distance && ` — ${distance} km`}
          </button>
        </div>
      </div>
    </div>
  );
}