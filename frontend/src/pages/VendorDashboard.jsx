import { useState, useEffect } from 'react';
import {
  MessageCircle, Package, MapPin, Truck,
  FileText, X, ChevronDown, ChevronUp,
  Map, Tag, Star
} from 'lucide-react';
import API from '../api/axios';
import ChatBox      from '../components/ChatBox';
import ImageUpload  from '../components/ImageUpload';
import MapPicker    from '../components/MapPicker';
import { generateInvoice } from '../utils/generateInvoice';
import { useAuth }         from '../context/AuthContext';
import { useAutoRefresh }  from '../hooks/useAutoRefresh';
import { useTranslation }  from 'react-i18next';
import toast from 'react-hot-toast';

const RATE_CARD = { bike:22,  van:77,  heavy:150 };
const BASE_FARE = { bike:30,  van:100, heavy:200 };

// ── Tip + Rating Component ──
function TipAndRating({ orderId, onSubmit }) {
  const [rating,     setRating]     = useState(0);
  const [tip,        setTip]        = useState('');
  const [review,     setReview]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const quickTips = [10, 20, 50, 100];

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating first');
    setSubmitting(true);
    try {
      await API.put(`/orders/${orderId}/rate`, {
        rating,
        review,
        tip: tip ? parseFloat(tip) : 0,
      });
      toast.success(
        tip && parseFloat(tip) > 0
          ? `Rating submitted! ₹${tip} tip sent to driver 🎉`
          : 'Rating submitted! Thank you ⭐'
      );
      onSubmit();
    } catch {
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50
                    dark:from-amber-900/20 dark:to-orange-900/20
                    rounded-xl p-4 border border-amber-200
                    dark:border-amber-700 space-y-3">
      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
        🎉 Delivered! Rate your experience
      </p>

      {/* Stars */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Rate the driver:
        </p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              className={`w-9 h-9 rounded-xl border-2 text-lg transition-all
                ${s <= rating
                  ? 'border-amber-400 bg-amber-100 dark:bg-amber-900/40 scale-110'
                  : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'}`}>
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Review */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Write a review (optional):
        </p>
        <input
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Great service, on time delivery..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700 rounded-xl
                     text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-amber-400
                     transition-all"
        />
      </div>

      {/* Quick tip buttons */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Tip the driver (optional):
        </p>
        <div className="flex gap-2 flex-wrap mb-2">
          {quickTips.map(qt => (
            <button key={qt}
              onClick={() => setTip(tip === qt.toString() ? '' : qt.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2
                          transition-all
                ${tip === qt.toString()
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-300'}`}>
              ₹{qt}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2
                           text-gray-400 text-sm font-medium">₹</span>
          <input
            type="number"
            value={tip}
            onChange={e => setTip(e.target.value)}
            placeholder="Custom tip amount"
            className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700 rounded-xl
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-green-400
                       transition-all"
          />
        </div>
        {tip && parseFloat(tip) > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">
            ✅ ₹{tip} will be credited to driver's wallet instantly 💚
          </p>
        )}
      </div>

      {/* Submit button */}
      <button onClick={handleSubmit} disabled={submitting || !rating}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600
                   disabled:bg-amber-300 dark:disabled:bg-amber-800
                   text-white font-bold rounded-xl text-sm transition-all
                   flex items-center justify-center gap-2">
        {submitting
          ? <div className="w-4 h-4 border-2 border-white/30
                            border-t-white rounded-full animate-spin"/>
          : <>
              <Star size={14}/>
              Submit {rating > 0 && `${rating}★`}
              {tip && parseFloat(tip) > 0 && ` + ₹${tip} Tip`}
            </>}
      </button>
    </div>
  );
}

// ── Status Tracker ──
function StatusTracker({ status }) {
  const { t } = useTranslation();
  const STATUS_STEPS = ['pending','accepted','picked_up','in_transit','delivered'];
  const idx = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1 flex-wrap my-3">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center
                          text-xs font-bold transition-all
                          ${i <= idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
            {i < idx ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] mx-1 hidden sm:block
                           ${i <= idx
                             ? 'text-blue-600 dark:text-blue-400'
                             : 'text-gray-400'}`}>
            {t(`status.${s}`)}
          </span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`w-4 h-0.5 mx-1
                            ${i < idx
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'}`}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──
export default function VendorDashboard() {
  const { user } = useAuth();
  const { t }    = useTranslation();

  const [orders,      setOrders]      = useState([]);
  const [chatOrder,   setChatOrder]   = useState(null);
  const [expanded,    setExpanded]    = useState({});
  const [loading,     setLoading]     = useState(false);
  const [showMap,     setShowMap]     = useState(false);
  const [surge,       setSurge]       = useState(null);
  const [estimate,    setEstimate]    = useState(null);
  const [promoCode,   setPromoCode]   = useState('');
  const [promoResult, setPromoResult] = useState(null);

  const [form, setForm] = useState({
    pickupAddress:    '',
    deliveryAddress:  '',
    goodsDescription: '',
    distanceKm:       '',
    vehicleType:      'bike',
    goodsImageUrl:    '',
    pickupCoords:     null,
    dropCoords:       null,
  });

  const set = f => setForm(p => ({...p, ...f}));

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    }
  };

  useAutoRefresh(fetchOrders, 8000);

  useEffect(() => {
    API.get('/promo/surge')
      .then(r => setSurge(r.data))
      .catch(() => {});
  }, []);

  const getEstimate = () => {
    if (!form.distanceKm) return toast.error('Enter distance first');
    let fare = BASE_FARE[form.vehicleType] +
               parseFloat(form.distanceKm) * RATE_CARD[form.vehicleType];
    if (surge?.isSurge) fare = Math.round(fare * surge.multiplier);
    setEstimate(Math.round(fare));
    setPromoResult(null);
  };

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const { data } = await API.post('/promo/validate', {
        code: promoCode, orderValue: estimate
      });
      setPromoResult(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code');
      setPromoResult(null);
    }
  };

  const handleBook = async () => {
    if (!form.pickupAddress || !form.deliveryAddress ||
        !form.goodsDescription || !form.distanceKm)
      return toast.error('Please fill all required fields');

    let finalFare = BASE_FARE[form.vehicleType] +
                    parseFloat(form.distanceKm) * RATE_CARD[form.vehicleType];
    if (surge?.isSurge) finalFare = Math.round(finalFare * surge.multiplier);
    if (promoResult)    finalFare = promoResult.finalAmount;
    finalFare = Math.round(finalFare);

    setLoading(true);
    try {
      await API.post('/orders', { ...form, fare: finalFare });
      if (promoCode && promoResult) {
        await API.post('/promo/apply', { code: promoCode }).catch(() => {});
      }
      toast.success('Order placed! Finding a driver...');
      setForm({
        pickupAddress:'', deliveryAddress:'', goodsDescription:'',
        distanceKm:'', vehicleType:'bike', goodsImageUrl:'',
        pickupCoords:null, dropCoords:null,
      });
      setEstimate(null);
      setPromoCode('');
      setPromoResult(null);
      fetchOrders();
    } catch {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await API.put(`/orders/${id}/cancel`, { reason:'Cancelled by vendor' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch {
      toast.error('Cannot cancel — driver already accepted');
    }
  };

  const toggleExpand = (id) =>
    setExpanded(p => ({...p, [id]: !p[id]}));

  const delivered  = orders.filter(o => o.status === 'delivered');
  const totalSpent = delivered.reduce((s, o) => s + (o.fare||0) + (o.tip||0), 0);

  const statusColors = {
    pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accepted:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    picked_up:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    in_transit: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📦 {t('vendor.dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Book deliveries and track your shipments
          </p>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('vendor.totalOrders'), value: orders.length,
              color:'text-blue-600',
              bg:'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { label: t('vendor.delivered'),   value: delivered.length,
              color:'text-green-600',
              bg:'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { label: t('vendor.totalSpent'),  value:`₹${totalSpent}`,
              color:'text-amber-600',
              bg:'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border p-4 text-center`}>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Booking Form ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
            {t('vendor.bookDelivery')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Map select button */}
            <div className="sm:col-span-2">
              <button onClick={() => setShowMap(true)}
                className="w-full flex items-center justify-center gap-2 py-3
                           border-2 border-dashed border-blue-300 dark:border-blue-700
                           rounded-xl text-blue-600 dark:text-blue-400 font-semibold
                           text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20
                           transition-all">
                <Map size={16}/>
                {form.pickupAddress
                  ? '✓ Locations selected — Click to change'
                  : t('vendor.selectOnMap')}
              </button>
            </div>

            {/* Pickup */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                {t('vendor.pickupAddress')}
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                <input
                  value={form.pickupAddress}
                  placeholder="From where?"
                  onChange={e => set({ pickupAddress: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Delivery */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                {t('vendor.deliveryAddress')}
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                <input
                  value={form.deliveryAddress}
                  placeholder="To where?"
                  onChange={e => set({ deliveryAddress: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Goods description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                {t('vendor.goodsDesc')}
              </label>
              <input
                value={form.goodsDescription}
                placeholder="e.g. 10 boxes of fabric"
                onChange={e => set({ goodsDescription: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700 rounded-xl
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           transition-all"
              />
            </div>

            {/* Distance */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                {t('vendor.distance')}
              </label>
              <input
                type="number"
                value={form.distanceKm}
                placeholder="e.g. 12"
                onChange={e => {
                  set({ distanceKm: e.target.value });
                  setEstimate(null);
                  setPromoResult(null);
                }}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700 rounded-xl
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           transition-all"
              />
            </div>

            {/* Vehicle type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                {t('vendor.vehicleType')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(RATE_CARD).map(([v, rate]) => (
                  <button key={v}
                    onClick={() => {
                      set({ vehicleType: v });
                      setEstimate(null);
                      setPromoResult(null);
                    }}
                    className={`py-2 rounded-xl border-2 text-center transition-all
                      ${form.vehicleType === v
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <div className="text-lg">
                      {v==='bike'?'🏍️':v==='van'?'🚐':'🚛'}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600
                                    dark:text-gray-300 capitalize">{v}</div>
                    <div className="text-[10px] text-blue-600
                                    dark:text-blue-400">₹{rate}/km</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goods image */}
            <div className="sm:col-span-2">
              <ImageUpload
                label={t('vendor.goodsPhoto')}
                endpoint="image"
                onUpload={url => set({ goodsImageUrl: url || '' })}
              />
            </div>

            {/* Surge warning */}
            {surge?.isSurge && (
              <div className="sm:col-span-2 flex items-center gap-3 px-4 py-3
                              bg-orange-50 dark:bg-orange-900/20 border
                              border-orange-200 dark:border-orange-700 rounded-xl">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
                    {t('vendor.surgeActive')}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
                    {surge.message}
                  </p>
                </div>
              </div>
            )}

            {/* Promo code */}
            {estimate && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  {t('vendor.promoCode')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2
                                              -translate-y-1/2 text-gray-400"/>
                    <input
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoResult(null);
                      }}
                      placeholder="e.g. SAVE100"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                                 dark:bg-gray-800 border border-gray-200
                                 dark:border-gray-700 rounded-xl text-gray-900
                                 dark:text-white placeholder-gray-400 uppercase
                                 tracking-widest focus:outline-none
                                 focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <button onClick={validatePromo}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700
                               text-white font-bold rounded-xl text-sm
                               transition-all flex-shrink-0">
                    {t('vendor.applyPromo')}
                  </button>
                </div>
                {promoResult && (
                  <div className="mt-2 px-4 py-3 bg-green-50 dark:bg-green-900/20
                                  border border-green-200 dark:border-green-700
                                  rounded-xl">
                    <p className="text-xs font-bold text-green-700 dark:text-green-400">
                      {promoResult.message}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                      Original: ₹{estimate} → Final: ₹{promoResult.finalAmount}
                      &nbsp;(saved ₹{promoResult.discount})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estimate + Book row */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button onClick={getEstimate}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700
                         dark:text-gray-200 rounded-xl text-sm font-semibold
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              💰 {t('vendor.getEstimate')}
            </button>

            {estimate && (
              <div className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20
                              border border-green-200 dark:border-green-800
                              rounded-xl text-sm font-semibold
                              text-green-700 dark:text-green-400">
                {promoResult ? (
                  <>
                    Final: ₹{promoResult.finalAmount}
                    <span className="line-through text-gray-400 ml-1.5 font-normal">
                      ₹{estimate}
                    </span>
                  </>
                ) : (
                  <>
                    Estimated: ₹{estimate}
                    {surge?.isSurge && (
                      <span className="ml-1.5 text-orange-500 text-xs">
                        (incl. surge)
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            <button onClick={handleBook} disabled={loading}
              className="ml-auto flex items-center gap-2 px-5 py-2.5
                         bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-bold rounded-xl text-sm transition-all
                         shadow-sm disabled:cursor-not-allowed">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30
                                  border-t-white rounded-full animate-spin"/>
                : <><Truck size={15}/> {t('vendor.bookBtn')}</>}
            </button>
          </div>
        </div>

        {/* ── Orders List ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('vendor.myOrders')}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({orders.length})
            </span>
          </h2>

          {orders.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border
                            border-gray-100 dark:border-gray-800 p-12 text-center">
              <Package size={40} className="mx-auto text-gray-300
                                            dark:text-gray-600 mb-3"/>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {t('vendor.noOrders')}
              </p>
            </div>
          )}

          {orders.map(o => (
            <div key={o._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border
                         border-gray-100 dark:border-gray-800 overflow-hidden
                         shadow-sm hover:shadow-md transition-shadow">

              {/* Order header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {o.goodsDescription}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      #{o._id.slice(-8).toUpperCase()}
                      &nbsp;·&nbsp;₹{(o.fare||0) + (o.tip||0)}
                      {o.tip > 0 && (
                        <span className="text-amber-500">
                          &nbsp;(+₹{o.tip} tip)
                        </span>
                      )}
                      &nbsp;·&nbsp;{o.distanceKm} km
                      &nbsp;·&nbsp;
                      {o.vehicleType==='bike'?'🏍️':o.vehicleType==='van'?'🚐':'🚛'}
                      {' '}{o.vehicleType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs
                                      font-semibold ${statusColors[o.status]}`}>
                      {t(`status.${o.status}`)}
                    </span>
                    <button onClick={() => toggleExpand(o._id)}
                      className="text-gray-400 hover:text-gray-600
                                 dark:hover:text-gray-200 transition-colors">
                      {expanded[o._id]
                        ? <ChevronUp size={18}/>
                        : <ChevronDown size={18}/>}
                    </button>
                  </div>
                </div>

                {/* Status tracker */}
                <StatusTracker status={o.status}/>

                {/* Addresses */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs
                                  text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>
                    {o.pickupAddress}
                  </div>
                  <div className="flex items-center gap-2 text-xs
                                  text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"/>
                    {o.deliveryAddress}
                  </div>
                </div>
              </div>

              {/* ── Expanded Section ── */}
              {expanded[o._id] && (
                <div className="border-t border-gray-100 dark:border-gray-800
                                p-4 space-y-3">

                  {/* Goods image */}
                  {o.goodsImageUrl && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500
                                    dark:text-gray-400 uppercase mb-2">
                        {t('vendor.goodsPhoto')}
                      </p>
                      <img
                        src={o.goodsImageUrl}
                        alt="goods"
                        className="w-full h-40 object-cover rounded-xl border
                                   border-gray-100 dark:border-gray-700"
                      />
                    </div>
                  )}

                  {/* Driver info */}
                  {o.driver ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl
                                    p-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-xs font-bold text-blue-700
                                    dark:text-blue-400 mb-2">
                        🧑‍✈️ {t('vendor.driverDetails')}
                      </p>
                      <div className="flex items-center gap-3">
                        {o.driver.profilePhoto ? (
                          <img src={o.driver.profilePhoto} alt=""
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-200
                                          dark:bg-blue-800 flex items-center
                                          justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-300
                                             font-bold text-sm">
                              {o.driver.name?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1 text-xs
                                        text-gray-600 dark:text-gray-300 flex-1">
                          <span>👤 <b>{o.driver.name}</b></span>
                          <span>📞 <b>{o.driver.phone}</b></span>
                          <span>🚗 <b>{o.driver.vehicle}</b></span>
                          <span>🔢 <b>{o.driver.vehicleNumber}</b></span>
                        </div>
                      </div>
                    </div>
                  ) : o.status === 'pending' ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400
                                  bg-amber-50 dark:bg-amber-900/20 rounded-xl
                                  px-3 py-2 border border-amber-100
                                  dark:border-amber-800">
                      ⏳ {t('vendor.waitingDriver')}
                    </p>
                  ) : null}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">

                    {/* Chat with driver */}
                    {o.driver &&
                     !['delivered','cancelled'].includes(o.status) && (
                      <button
                        onClick={() =>
                          setChatOrder(chatOrder?._id === o._id ? null : o)}
                        className="flex items-center gap-1.5 px-3 py-2
                                   rounded-xl text-xs font-semibold
                                   bg-purple-50 dark:bg-purple-900/20
                                   text-purple-600 dark:text-purple-400
                                   border border-purple-200 dark:border-purple-700
                                   hover:bg-purple-100 transition-colors">
                        <MessageCircle size={13}/>
                        {t('vendor.chatDriver')}
                      </button>
                    )}

                    {/* Download invoice */}
                    {o.status === 'delivered' && (
                      <button
                        onClick={() =>
                          generateInvoice(o, user?.name, user?.shopName)}
                        className="flex items-center gap-1.5 px-3 py-2
                                   rounded-xl text-xs font-semibold
                                   bg-green-50 dark:bg-green-900/20
                                   text-green-600 dark:text-green-400
                                   border border-green-200 dark:border-green-700
                                   hover:bg-green-100 transition-colors">
                        <FileText size={13}/>
                        {t('vendor.downloadInvoice')}
                      </button>
                    )}

                    {/* Cancel */}
                    {o.status === 'pending' && (
                      <button onClick={() => handleCancel(o._id)}
                        className="flex items-center gap-1.5 px-3 py-2
                                   rounded-xl text-xs font-semibold
                                   bg-red-50 dark:bg-red-900/20
                                   text-red-600 dark:text-red-400
                                   border border-red-200 dark:border-red-700
                                   hover:bg-red-100 transition-colors">
                        <X size={13}/>
                        {t('vendor.cancelOrder')}
                      </button>
                    )}
                  </div>

                  {/* Rating shown */}
                  {o.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500">
                        {'⭐'.repeat(o.rating)}
                      </span>
                      {o.tip > 0 && (
                        <span className="text-xs text-green-600 dark:text-green-400
                                         font-medium">
                          + ₹{o.tip} tip sent
                        </span>
                      )}
                      {o.review && (
                        <span className="text-xs text-gray-400 italic">
                          "{o.review}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tip + Rating form */}
                  {o.status === 'delivered' && !o.rating && (
                    <TipAndRating
                      orderId={o._id}
                      onSubmit={fetchOrders}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Map Picker Modal ── */}
      {showMap && (
        <MapPicker
          onClose={() => setShowMap(false)}
          onConfirm={(data) => {
            set({
              pickupAddress:   data.pickupAddress,
              deliveryAddress: data.deliveryAddress,
              distanceKm:      data.distanceKm,
              pickupCoords:    data.pickupCoords,
              dropCoords:      data.dropCoords,
            });
            setEstimate(null);
            setPromoResult(null);
            setShowMap(false);
            toast.success(`Locations set! Distance: ${data.distanceKm} km`);
          }}
        />
      )}

      {/* ── Chat Box ── */}
      {chatOrder && (
        <ChatBox order={chatOrder} onClose={() => setChatOrder(null)}/>
      )}
    </div>
  );
}