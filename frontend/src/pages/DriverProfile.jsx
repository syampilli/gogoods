import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star, Package, IndianRupee, TrendingUp,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name.includes('₹') || p.name === 'Earned'
            ? `₹${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DriverProfile() {
  const { user }    = useAuth();
  const [earnings,  setEarnings]  = useState(null);
  const [available, setAvailable] = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState({});
  const [period,    setPeriod]    = useState('week');

  useEffect(() => {
    fetchEarnings();
    API.get('/profile').then(r => setAvailable(r.data.isAvailable));
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data } = await API.get('/profile/earnings');
      setEarnings(data);
    } catch {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await API.put('/profile/availability');
      setAvailable(data.isAvailable);
      toast.success(
        data.isAvailable ? '🟢 You are now Online!' : '🔴 You are now Offline'
      );
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const toggleExpand = (id) =>
    setExpanded(p => ({...p, [id]: !p[id]}));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent
                      rounded-full animate-spin"/>
    </div>
  );

  const periodAmount =
    period === 'today' ? earnings?.today  :
    period === 'week'  ? earnings?.week   :
    period === 'month' ? earnings?.month  : earnings?.total;

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
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💼 Driver Hub
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Earnings, history & availability
            </p>
          </div>

          {/* Availability toggle */}
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl
                        font-bold text-sm transition-all border-2
              ${available
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'}`}>
            {available
              ? <ToggleRight size={20}/>
              : <ToggleLeft  size={20}/>}
            {available ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Earnings summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Today',     value:`₹${earnings?.today  || 0}`, color:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { label:'This Week', value:`₹${earnings?.week   || 0}`, color:'text-green-600',  bg:'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { label:'This Month',value:`₹${earnings?.month  || 0}`, color:'text-purple-600', bg:'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
            { label:'Total',     value:`₹${earnings?.total  || 0}`, color:'text-amber-600',  bg:'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border p-4 text-center`}>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Earnings chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">
            Earnings — Last 7 Days
          </h2>
          {earnings?.last7?.every(d => d.earned === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No deliveries in last 7 days
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={earnings?.last7 || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"
                               strokeOpacity={0.5}/>
                <XAxis dataKey="date" tick={{ fontSize:10, fill:'#94a3b8' }}/>
                <YAxis tick={{ fontSize:10, fill:'#94a3b8' }}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="earned"     fill="#10b981"
                     radius={[4,4,0,0]} name="Earned (₹)"/>
                <Bar dataKey="deliveries" fill="#8b5cf6"
                     radius={[4,4,0,0]} name="Deliveries"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivery history */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white">
            Delivery History
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({earnings?.orders?.length || 0} total)
            </span>
          </h2>

          {!earnings?.orders?.length ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border
                            border-gray-100 dark:border-gray-800 p-10 text-center">
              <Package size={36} className="mx-auto text-gray-300
                                             dark:text-gray-600 mb-3"/>
              <p className="text-gray-400 text-sm">No deliveries yet</p>
            </div>
          ) : (
            earnings.orders.map(o => (
              <div key={o._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                           border-gray-100 dark:border-gray-800 overflow-hidden
                           shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                        {o.goodsDescription}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{o._id.slice(-8).toUpperCase()} ·{' '}
                        {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600
                                      dark:text-green-400">
                          ₹{(o.fare || 0) + (o.tip || 0)}
                        </p>
                        {o.tip > 0 && (
                          <p className="text-xs text-amber-500">
                            +₹{o.tip} tip
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs
                                        font-semibold ${statusColors[o.status]}`}>
                        {o.status.replace(/_/g,' ')}
                      </span>
                      <button onClick={() => toggleExpand(o._id)}
                        className="text-gray-400 hover:text-gray-600
                                   dark:hover:text-gray-200">
                        {expanded[o._id]
                          ? <ChevronUp size={16}/>
                          : <ChevronDown size={16}/>}
                      </button>
                    </div>
                  </div>
                </div>

                {expanded[o._id] && (
                  <div className="border-t border-gray-100 dark:border-gray-800
                                  px-4 py-3 space-y-2">
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
                    <div className="flex items-center gap-3 mt-2 text-xs
                                    text-gray-500 dark:text-gray-400">
                      <span>📏 {o.distanceKm} km</span>
                      <span>💰 Fare: ₹{o.fare}</span>
                      {o.tip > 0 && <span>🎁 Tip: ₹{o.tip}</span>}
                      {o.rating && <span>⭐ {o.rating}/5</span>}
                    </div>
                    {o.vendor && (
                      <div className="flex items-center gap-2 text-xs
                                      text-gray-500 dark:text-gray-400">
                        <span>🏪 {o.vendor?.shopName || o.vendor?.name}</span>
                        <span>📞 {o.vendor?.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}