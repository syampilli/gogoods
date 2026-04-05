import { useState, useEffect } from 'react';
import {
  MessageCircle, Package, Clock,
  CheckCircle, ChevronDown, ChevronUp, Map
} from 'lucide-react';
import API from '../api/axios';
import ChatBox      from '../components/ChatBox';
import OrderMapView from '../components/OrderMapView';
import toast from 'react-hot-toast';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useTranslation } from 'react-i18next';

const RATE_CARD = { bike: 22, van: 77, heavy: 150 };

const STATUS_STEPS = ['pending','accepted','picked_up','in_transit','delivered'];

const nextStatus = {
  accepted:   'picked_up',
  picked_up:  'in_transit',
  in_transit: 'delivered'
};

const nextLabel = {
  accepted:   '📦 Mark Picked Up',
  picked_up:  '🚗 Mark In Transit',
  in_transit: '✅ Mark Delivered'
};

// ✅ Fix — useTranslation ని component లోపల పెట్టాలి
function StatusTracker({ status }) {
  const { t } = useTranslation(); // ← component లోపల
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 flex-wrap my-3">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center
                          text-xs font-bold transition-all
                          ${i <= idx
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
            {i < idx ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] mx-1 hidden sm:block
                           ${i <= idx
                             ? 'text-green-600 dark:text-green-400'
                             : 'text-gray-400'}`}>
            {t(`status.${s}`)}
          </span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`w-4 h-0.5 mx-1
                            ${i < idx
                              ? 'bg-green-600'
                              : 'bg-gray-200 dark:bg-gray-700'}`}/>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DriverDashboard() {
  // ✅ అన్ని hooks ఇక్కడ — component లోపల మొదట్లో
  const { t } = useTranslation();

  const [myOrders,      setMyOrders]      = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [chatOrder,     setChatOrder]     = useState(null);
  const [mapOrder,      setMapOrder]      = useState(null);
  const [expanded,      setExpanded]      = useState({});
  const [tab,           setTab]           = useState('available');

  const fetchData = async () => {
    try {
      const [mine, pending] = await Promise.all([
        API.get('/orders'),
        API.get('/orders/pending')
      ]);
      setMyOrders(mine.data);
      setPendingOrders(
        pending.data.filter(o => !mine.data.find(m => m._id === o._id))
      );
    } catch {
      toast.error('Failed to load orders');
    }
  };

  useAutoRefresh(fetchData, 8000);

  const acceptOrder = async (id) => {
    try {
      await API.put(`/orders/${id}/accept`);
      toast.success('Job accepted! Head to pickup location.');
      fetchData();
      setTab('myDeliveries');
    } catch {
      toast.error('Failed to accept order');
    }
  };

  const rejectOrder = async (id) => {
    try {
      await API.put(`/orders/${id}/reject`);
      toast('Order skipped', { icon: '👋' });
      fetchData();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success(`Marked as ${status.replace(/_/g,' ')}!`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggleExpand = (id) =>
    setExpanded(p => ({...p, [id]: !p[id]}));

  // Stats
  const delivered = myOrders.filter(o => o.status === 'delivered');
  const active    = myOrders.filter(
    o => !['delivered','cancelled'].includes(o.status)
  );
  const earnings  = delivered.reduce((s, o) => s + (o.fare||0) + (o.tip||0), 0);
  const avgRating = delivered.filter(o => o.rating).length > 0
    ? (delivered.reduce((s,o) => s + (o.rating||0), 0) /
       delivered.filter(o=>o.rating).length).toFixed(1)
    : 'N/A';

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

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧑‍✈️ {t('driver.dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Accept jobs and manage your deliveries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('driver.delivered'),  value: delivered.length,
              icon:'✅',
              color:'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { label: t('driver.activeJobs'), value: active.length,
              icon:'🚗',
              color:'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { label: t('driver.earnings'),   value:`₹${earnings}`,
              icon:'💰',
              color:'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
            { label: t('driver.avgRating'),  value: avgRating,
              icon:'⭐',
              color:'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
          ].map(s => (
            <div key={s.label}
              className={`${s.color} rounded-2xl border p-4 text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {s.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          {[
            { key:'available',
              label:`${t('driver.availableJobs')} (${pendingOrders.length})` },
            { key:'myDeliveries',
              label:`${t('driver.myDeliveries')} (${myOrders.length})` },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold
                          transition-all
                ${tab === tb.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── Available Jobs Tab ── */}
        {tab === 'available' && (
          <div className="space-y-4">
            {pendingOrders.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border
                              border-gray-100 dark:border-gray-800 p-12 text-center">
                <Clock size={40} className="mx-auto text-gray-300
                                             dark:text-gray-600 mb-3"/>
                <p className="text-gray-400 dark:text-gray-500">
                  {t('driver.noJobs')}
                </p>
              </div>
            )}

            {pendingOrders.map(o => (
              <div key={o._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                           border-gray-100 dark:border-gray-800 p-5 shadow-sm
                           hover:shadow-md transition-shadow">

                {/* Job header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {o.goodsDescription}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{o._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-green-600
                                  dark:text-green-400">
                      ₹{o.fare}
                    </p>
                    <p className="text-xs text-gray-400">{o.distanceKm} km</p>
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm
                                  text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>
                    <span className="truncate">{o.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm
                                  text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"/>
                    <span className="truncate">{o.deliveryAddress}</span>
                  </div>
                </div>

                {/* Vendor info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3
                                border border-amber-100 dark:border-amber-800 mb-4">
                  <p className="text-xs font-bold text-amber-700
                                dark:text-amber-400 mb-1">
                    🏪 {t('driver.vendorDetails')}
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs
                                  text-gray-600 dark:text-gray-300">
                    <span>👤 {o.vendor?.name}</span>
                    <span>📞 {o.vendor?.phone}</span>
                    <span className="col-span-2">
                      🏬 {o.vendor?.shopName || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Vehicle + rate */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800
                                   text-gray-600 dark:text-gray-300 rounded-lg
                                   text-xs font-medium capitalize">
                    {o.vehicleType==='bike'?'🏍️':
                     o.vehicleType==='van' ?'🚐':'🚛'} {o.vehicleType}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800
                                   text-gray-600 dark:text-gray-300 rounded-lg
                                   text-xs font-medium">
                    ₹{RATE_CARD[o.vehicleType] || 22}/km
                  </span>
                </div>

                {/* Preview route on map */}
                <button
                  onClick={() => setMapOrder(o)}
                  className="w-full flex items-center justify-center gap-2
                             py-2 mb-3 bg-gray-50 dark:bg-gray-800
                             text-gray-600 dark:text-gray-300 border
                             border-gray-200 dark:border-gray-700 rounded-xl
                             text-sm font-medium hover:bg-gray-100
                             dark:hover:bg-gray-700 transition-colors">
                  <Map size={14}/>
                  Preview Route on Map
                </button>

                {/* Accept / Reject */}
                <div className="flex gap-3">
                  <button onClick={() => acceptOrder(o._id)}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700
                               text-white font-bold rounded-xl text-sm
                               transition-all flex items-center
                               justify-center gap-2">
                    <CheckCircle size={15}/>
                    {t('driver.acceptJob')}
                  </button>
                  <button onClick={() => rejectOrder(o._id)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800
                               text-gray-600 dark:text-gray-300 font-semibold
                               rounded-xl text-sm hover:bg-red-50
                               dark:hover:bg-red-900/20 hover:text-red-600
                               dark:hover:text-red-400 border border-gray-200
                               dark:border-gray-700 transition-all">
                    {t('driver.skip')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── My Deliveries Tab ── */}
        {tab === 'myDeliveries' && (
          <div className="space-y-4">
            {myOrders.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border
                              border-gray-100 dark:border-gray-800 p-12 text-center">
                <Package size={40} className="mx-auto text-gray-300
                                              dark:text-gray-600 mb-3"/>
                <p className="text-gray-400 dark:text-gray-500">
                  {t('driver.noDeliveries')}
                </p>
              </div>
            )}

            {myOrders.map(o => (
              <div key={o._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                           border-gray-100 dark:border-gray-800 overflow-hidden
                           shadow-sm hover:shadow-md transition-shadow">

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {o.goodsDescription}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{o._id.slice(-8).toUpperCase()}
                        &nbsp;·&nbsp;₹{(o.fare||0) + (o.tip||0)}
                        {o.tip > 0 && (
                          <span className="text-amber-500">
                            &nbsp;(+₹{o.tip} tip)
                          </span>
                        )}
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

                  <StatusTracker status={o.status}/>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs
                                    text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500"/>
                      {o.pickupAddress}
                    </div>
                    <div className="flex items-center gap-2 text-xs
                                    text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-red-500"/>
                      {o.deliveryAddress}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expanded[o._id] && (
                  <div className="border-t border-gray-100 dark:border-gray-800
                                  p-4 space-y-3">

                    {/* Vendor info */}
                    {o.vendor && (
                      <div className="bg-amber-50 dark:bg-amber-900/20
                                      rounded-xl p-3 border border-amber-100
                                      dark:border-amber-800">
                        <p className="text-xs font-bold text-amber-700
                                      dark:text-amber-400 mb-2">
                          🏪 {t('driver.vendorDetails')}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs
                                        text-gray-600 dark:text-gray-300">
                          <span>👤 {o.vendor.name}</span>
                          <span>📞 {o.vendor.phone}</span>
                          <span className="col-span-2">
                            🏬 {o.vendor.shopName || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">

                      {/* Update status */}
                      {nextStatus[o.status] && (
                        <button
                          onClick={() =>
                            updateStatus(o._id, nextStatus[o.status])}
                          className="flex items-center gap-1.5 px-4 py-2
                                     bg-blue-600 hover:bg-blue-700 text-white
                                     font-semibold rounded-xl text-xs
                                     transition-all">
                          {nextLabel[o.status]}
                        </button>
                      )}

                      {/* View on map */}
                      {['accepted','picked_up','in_transit'].includes(o.status) && (
                        <button
                          onClick={() => setMapOrder(o)}
                          className="flex items-center gap-1.5 px-3 py-2
                                     rounded-xl text-xs font-semibold
                                     bg-blue-50 dark:bg-blue-900/20
                                     text-blue-600 dark:text-blue-400
                                     border border-blue-200 dark:border-blue-700
                                     hover:bg-blue-100 transition-colors">
                          <Map size={13}/>
                          View Route on Map
                        </button>
                      )}

                      {/* Chat with vendor */}
                      {['accepted','picked_up','in_transit'].includes(o.status) && (
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
                          {t('driver.chatVendor')}
                        </button>
                      )}
                    </div>

                    {/* Delivered message */}
                    {o.status === 'delivered' && (
                      <div className="flex items-center gap-2 text-green-600
                                      dark:text-green-400 text-sm font-semibold">
                        <CheckCircle size={16}/>
                        Delivered!
                        {o.rating && ` · Rated: ${'⭐'.repeat(o.rating)}`}
                        {o.tip > 0 && ` · Tip received: ₹${o.tip} 🎉`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Box */}
      {chatOrder && (
        <ChatBox order={chatOrder} onClose={() => setChatOrder(null)}/>
      )}

      {/* Map View Modal */}
      {mapOrder && (
        <OrderMapView order={mapOrder} onClose={() => setMapOrder(null)}/>
      )}
    </div>
  );
}