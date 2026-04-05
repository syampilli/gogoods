import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Package, Users, IndianRupee,
  Truck, Star, AlertCircle
} from 'lucide-react';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}:{' '}
          {['revenue','earned','spent'].some(k =>
            p.name?.toLowerCase().includes(k))
            ? `₹${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  const bgMap = {
    'text-blue-600':   'bg-blue-50 dark:bg-blue-900/20',
    'text-green-600':  'bg-green-50 dark:bg-green-900/20',
    'text-purple-600': 'bg-purple-50 dark:bg-purple-900/20',
    'text-amber-600':  'bg-amber-50 dark:bg-amber-900/20',
    'text-cyan-600':   'bg-cyan-50 dark:bg-cyan-900/20',
    'text-teal-600':   'bg-teal-50 dark:bg-teal-900/20',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border
                    border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500
                        uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                         ${bgMap[color] || 'bg-gray-50 dark:bg-gray-800'}`}>
          <Icon size={20} className={color}/>
        </div>
      </div>
    </div>
  );
}

function AdminAnalytics({ data }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Package}     label="Total Orders"
          value={data.summary.totalOrders}
          color="text-blue-600"
          sub={`${data.summary.deliveredCount} delivered`}/>
        <StatCard icon={IndianRupee} label="Total Revenue"
          value={`₹${data.summary.totalRevenue}`}
          color="text-green-600"
          sub={`Avg ₹${data.summary.avgFare}/order`}/>
        <StatCard icon={Users}       label="Vendors"
          value={data.summary.totalVendors}
          color="text-purple-600"/>
        <StatCard icon={Truck}       label="Drivers"
          value={data.summary.totalDrivers}
          color="text-amber-600"/>
        <StatCard icon={TrendingUp}  label="Avg Fare"
          value={`₹${data.summary.avgFare}`}
          color="text-cyan-600"/>
        <StatCard icon={Star}        label="Success Rate"
          value={`${Math.round(
            data.summary.deliveredCount /
            (data.summary.totalOrders || 1) * 100)}%`}
          color="text-teal-600"/>
      </div>

      {/* Orders per day */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border
                      border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 dark:text-white mb-5">
          {t('analytics.ordersChart')}
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.ordersPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"
                           strokeOpacity={0.5}/>
            <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94a3b8' }}/>
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="orders" fill="#3b82f6"
                 radius={[6,6,0,0]} name="Orders"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue per day */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border
                      border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 dark:text-white mb-5">
          {t('analytics.revenueChart')}
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.revenuePerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"
                           strokeOpacity={0.5}/>
            <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94a3b8' }}/>
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line dataKey="revenue" stroke="#10b981" strokeWidth={2.5}
                  dot={{ fill:'#10b981', r:4 }} name="Revenue (₹)"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Vehicle breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">
            {t('analytics.byVehicle')}
          </h2>
          {data.vehicleBreakdown.every(v => v.count === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {t('analytics.noData')}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.vehicleBreakdown.filter(v => v.count > 0)}
                  dataKey="count"
                  nameKey="vehicle"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label={({ vehicle, count }) => `${vehicle}: ${count}`}>
                  {data.vehicleBreakdown
                    .filter(v => v.count > 0)
                    .map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">
            {t('analytics.byStatus')}
          </h2>
          {data.statusBreakdown.every(s => s.count === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {t('analytics.noData')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.statusBreakdown
                .filter(s => s.count > 0)
                .map((s, i) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500
                                     dark:text-gray-400 w-24 capitalize shrink-0">
                      {s.status.replace(/_/g,' ')}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800
                                    rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all"
                        style={{
                          width:`${Math.round(s.count /
                            (data.summary.totalOrders || 1) * 100)}%`,
                          background: COLORS[i % COLORS.length]
                        }}/>
                    </div>
                    <span className="text-xs font-bold text-gray-700
                                     dark:text-gray-300 w-6 text-right shrink-0">
                      {s.count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserAnalytics({ data, role }) {
  const { t }    = useTranslation();
  const isVendor = role === 'vendor';
  const s        = data.summary;

  const cards = isVendor
    ? [
        { icon: Package,     label: 'Total Orders',
          value: s.totalOrders,       color: 'text-blue-600'   },
        { icon: TrendingUp,  label: 'Delivered',
          value: s.delivered,         color: 'text-green-600'  },
        { icon: IndianRupee, label: 'Total Spent',
          value: `₹${s.totalSpent}`,  color: 'text-amber-600'  },
        { icon: Star,        label: 'Avg Rating',
          value: s.avgRating,         color: 'text-purple-600' },
      ]
    : [
        { icon: Package,     label: 'Deliveries',
          value: s.totalDeliveries,   color: 'text-blue-600'   },
        { icon: IndianRupee, label: 'Total Earned',
          value: `₹${s.earnings}`,    color: 'text-green-600'  },
        { icon: Truck,       label: 'Active Jobs',
          value: s.activeJobs,        color: 'text-amber-600'  },
        { icon: Star,        label: 'Avg Rating',
          value: s.avgRating,         color: 'text-purple-600' },
      ];

  const chartTitle = isVendor
    ? t('analytics.ordersSpending')
    : t('analytics.deliveriesEarnings');

  const isEmpty = data.last7.every(d =>
    (d.orders      ?? 0) === 0 &&
    (d.deliveries  ?? 0) === 0 &&
    (d.spent       ?? 0) === 0 &&
    (d.earned      ?? 0) === 0
  );

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(c => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            color={c.color}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border
                      border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 dark:text-white mb-5">
          {chartTitle}
        </h2>

        {isEmpty ? (
          <p className="text-gray-400 text-sm text-center py-10">
            {t('analytics.noActivity')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"
                             strokeOpacity={0.5}/>
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94a3b8' }}/>
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              {isVendor ? (
                <>
                  <Bar dataKey="orders" fill="#3b82f6"
                       radius={[4,4,0,0]} name="Orders"/>
                  <Bar dataKey="spent"  fill="#f59e0b"
                       radius={[4,4,0,0]} name="Spent (₹)"/>
                </>
              ) : (
                <>
                  <Bar dataKey="deliveries" fill="#10b981"
                       radius={[4,4,0,0]} name="Deliveries"/>
                  <Bar dataKey="earned"     fill="#8b5cf6"
                       radius={[4,4,0,0]} name="Earned (₹)"/>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { user }  = useAuth();
  const { t }     = useTranslation();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!user) return;
    const endpoint =
      user.role === 'admin'  ? '/analytics' :
      user.role === 'vendor' ? '/analytics/vendor' :
                               '/analytics/driver';
    API.get(endpoint)
      .then(r  => { setData(r.data); setLoading(false); })
      .catch(e => {
        setError(e.response?.data?.message || 'Failed to load analytics');
        setLoading(false);
      });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent
                        rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400 text-sm">{t('analytics.loading')}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={40} className="mx-auto text-red-400 mb-3"/>
        <p className="text-gray-600 dark:text-gray-300 font-medium">{error}</p>
        <p className="text-gray-400 text-xs mt-2">
          Backend running ఉందా? /api/analytics route registered అయిందా check చేయి
        </p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 {t('analytics.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.role === 'admin'
              ? t('analytics.platformWide')
              : t('analytics.personal')}
          </p>
        </div>

        {user?.role === 'admin'
          ? <AdminAnalytics data={data}/>
          : <UserAnalytics  data={data} role={user?.role}/>}
      </div>
    </div>
  );
}