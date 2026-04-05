import { useState, useEffect } from 'react';
import {
  Package, IndianRupee, Star, Filter,
  ChevronDown, ChevronUp, Search
} from 'lucide-react';
import API from '../api/axios';
import { generateInvoice } from '../utils/generateInvoice';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { user }   = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({});

  // Filters
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all');
  const [vehicleFilter,setVehicleFilter] = useState('all');
  const [dateFilter,  setDateFilter]  = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, search, statusFilter, vehicleFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.goodsDescription?.toLowerCase().includes(q) ||
        o.pickupAddress?.toLowerCase().includes(q) ||
        o.deliveryAddress?.toLowerCase().includes(q) ||
        o._id.slice(-8).toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Vehicle filter
    if (vehicleFilter !== 'all') {
      result = result.filter(o => o.vehicleType === vehicleFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const start = new Date(now.setHours(0,0,0,0));
      result = result.filter(o => new Date(o.createdAt) >= start);
    } else if (dateFilter === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      result = result.filter(o => new Date(o.createdAt) >= start);
    } else if (dateFilter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(o => new Date(o.createdAt) >= start);
    }

    setFiltered(result);
  };

  const toggleExpand = (id) =>
    setExpanded(p => ({...p, [id]: !p[id]}));

  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((s,o) => s + (o.fare||0) + (o.tip||0), 0);

  const statusColors = {
    pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accepted:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    picked_up:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    in_transit: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent
                      rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Order History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Filter and view all your deliveries
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Total Orders',  value: orders.length,
              color:'text-blue-600',
              bg:'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { label:'Delivered',
              value: orders.filter(o=>o.status==='delivered').length,
              color:'text-green-600',
              bg:'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { label:'Total Spent',   value:`₹${totalSpent}`,
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

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-4 shadow-sm
                        space-y-3">

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2
                                         -translate-y-1/2 text-gray-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by goods, address or order ID..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700 rounded-xl
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition-all"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-3 gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700 rounded-xl
                         text-gray-700 dark:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Vehicle */}
            <select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700 rounded-xl
                         text-gray-700 dark:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Vehicles</option>
              <option value="bike">🏍️ Bike</option>
              <option value="van">🚐 Van</option>
              <option value="heavy">🚛 Heavy</option>
            </select>

            {/* Date */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700 rounded-xl
                         text-gray-700 dark:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {orders.length} orders
          </p>
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 p-12 text-center">
            <Package size={40} className="mx-auto text-gray-300
                                          dark:text-gray-600 mb-3"/>
            <p className="text-gray-400 text-sm">No orders match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => (
              <div key={o._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                           border-gray-100 dark:border-gray-800 overflow-hidden
                           shadow-sm hover:shadow-md transition-shadow">

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white
                                    truncate text-sm">
                        {o.goodsDescription}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{o._id.slice(-8).toUpperCase()}
                        &nbsp;·&nbsp;
                        {new Date(o.createdAt).toLocaleDateString('en-IN',{
                          day:'2-digit', month:'short', year:'numeric'
                        })}
                        &nbsp;·&nbsp;
                        {o.vehicleType==='bike'?'🏍️':o.vehicleType==='van'?'🚐':'🚛'}
                        {' '}{o.vehicleType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{(o.fare||0) + (o.tip||0)}
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

                  {/* Addresses */}
                  <div className="mt-2 space-y-1">
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

                {/* Expanded */}
                {expanded[o._id] && (
                  <div className="border-t border-gray-100 dark:border-gray-800
                                  p-4 space-y-3">
                    {/* Driver info */}
                    {o.driver && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl
                                      p-3 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-700
                                      dark:text-blue-400 mb-1.5">
                          🧑‍✈️ Driver
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs
                                        text-gray-600 dark:text-gray-300">
                          <span>👤 {o.driver.name}</span>
                          <span>📞 {o.driver.phone}</span>
                          <span>🚗 {o.driver.vehicle}</span>
                          <span>🔢 {o.driver.vehicleNumber}</span>
                        </div>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 text-xs
                                    text-gray-500 dark:text-gray-400">
                      <span>📏 {o.distanceKm} km</span>
                      <span>💰 Fare: ₹{o.fare}</span>
                      {o.tip > 0 && <span>🎁 Tip: ₹{o.tip}</span>}
                      {o.rating && <span>⭐ {o.rating}/5</span>}
                    </div>

                    {/* Invoice download */}
                    {o.status === 'delivered' && (
                      <button
                        onClick={() => generateInvoice(o, user?.name, user?.shopName)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                                   text-xs font-semibold bg-green-50
                                   dark:bg-green-900/20 text-green-600
                                   dark:text-green-400 border border-green-200
                                   dark:border-green-700 hover:bg-green-100
                                   transition-colors">
                        📄 Download Invoice
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}