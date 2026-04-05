import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users,  setUsers]  = useState([]);
  const [tab,    setTab]    = useState('orders');

  const fetchOrders = () => API.get('/orders').then(r => setOrders(r.data));
  const fetchUsers  = () => API.get('/admin/users').then(r => setUsers(r.data));

  useEffect(() => { fetchOrders(); fetchUsers(); }, []);

  const toggleBlock = async (id) => {
    await API.put(`/admin/users/${id}/block`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await API.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const statusColor = {
    pending:'#f59e0b', accepted:'#3b82f6', picked_up:'#8b5cf6',
    in_transit:'#06b6d4', delivered:'#10b981', cancelled:'#ef4444'
  };

  const counts = {
    total:     orders.length,
    pending:   orders.filter(o => o.status==='pending').length,
    active:    orders.filter(o => ['accepted','picked_up','in_transit'].includes(o.status)).length,
    delivered: orders.filter(o => o.status==='delivered').length,
  };

  return (
    <div style={S.page}>
      <h2 style={S.heading}>🛡️ Admin Dashboard</h2>

      <div style={S.statsRow}>
        {[['Total Orders',counts.total,'#3b82f6'],['Pending',counts.pending,'#f59e0b'],
          ['Active',counts.active,'#8b5cf6'],['Delivered',counts.delivered,'#10b981']
        ].map(([label,val,color]) => (
          <div key={label} style={{...S.stat, borderTop:`4px solid ${color}`}}>
            <div style={{...S.statNum, color}}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['orders','users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{...S.tabBtn, ...(tab===t ? S.tabActive : {})}}>
            {t === 'orders' ? '📋 Orders' : '👥 Users'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div style={S.card}>
          <h3 style={S.subhead}>All Orders</h3>
          {orders.map(o => (
            <div key={o._id} style={S.orderRow}>
              <div style={{flex:1}}>
                <span style={S.goods}>{o.goodsDescription}</span>
                <p style={S.addr}>🏪 Vendor: {o.vendor?.name} ({o.vendor?.phone})</p>
                <p style={S.addr}>🧑 Driver: {o.driver?.name || 'Unassigned'}
                  {o.driver && ` | ${o.driver.vehicleNumber}`}</p>
                <p style={S.addr}>{o.pickupAddress} → {o.deliveryAddress}</p>
                <p style={S.addr}>📏 {o.distanceKm} km | 💰 ₹{o.fare}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <span style={{...S.badge, background: statusColor[o.status]}}>
                  {o.status.replace(/_/g,' ')}
                </span>
                {o.rating && <p style={{ color:'#f59e0b', marginTop:'4px' }}>{'⭐'.repeat(o.rating)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div style={S.card}>
          <h3 style={S.subhead}>All Users</h3>
          {users.map(u => (
            <div key={u._id} style={S.orderRow}>
              <div style={{flex:1}}>
                <span style={S.goods}>{u.name}</span>
                <span style={{...S.roleBadge,
                  background: u.role==='admin'?'#7c3aed':u.role==='driver'?'#f59e0b':'#3b82f6'}}>
                  {u.role}
                </span>
                <p style={S.addr}>📧 {u.email} | 📞 {u.phone}</p>
                {u.shopName     && <p style={S.addr}>🏬 {u.shopName}</p>}
                {u.vehicleNumber && <p style={S.addr}>🚗 {u.vehicle} — {u.vehicleNumber}</p>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <button style={{...S.blockBtn,
                  background: u.isBlocked ? '#10b981':'#f59e0b'}}
                  onClick={() => toggleBlock(u._id)}>
                  {u.isBlocked ? '✅ Unblock' : '🚫 Block'}
                </button>
                <button style={S.deleteBtn} onClick={() => deleteUser(u._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page:      { maxWidth:'860px', margin:'0 auto', padding:'24px' },
  heading:   { fontSize:'24px', color:'#1e293b', marginBottom:'20px' },
  subhead:   { fontSize:'18px', color:'#334155', marginBottom:'16px' },
  statsRow:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' },
  stat:      { background:'#fff', padding:'20px', borderRadius:'12px',
               boxShadow:'0 2px 12px rgba(0,0,0,0.08)', textAlign:'center' },
  statNum:   { fontSize:'30px', fontWeight:'700' },
  statLabel: { fontSize:'12px', color:'#64748b', marginTop:'4px' },
  card:      { background:'#fff', padding:'24px', borderRadius:'12px',
               boxShadow:'0 2px 12px rgba(0,0,0,0.08)' },
  orderRow:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
               border:'1px solid #e2e8f0', borderRadius:'8px', padding:'14px', marginBottom:'12px' },
  badge:     { padding:'4px 10px', borderRadius:'20px', color:'#fff', fontSize:'12px', fontWeight:'500' },
  roleBadge: { padding:'2px 8px', borderRadius:'12px', color:'#fff', fontSize:'11px',
               fontWeight:'600', marginLeft:'8px' },
  goods:     { fontWeight:'600', color:'#1e293b' },
  addr:      { fontSize:'13px', color:'#64748b', margin:'3px 0' },
  tabBtn:    { padding:'8px 20px', borderRadius:'8px', border:'1px solid #e2e8f0',
               background:'#f8fafc', cursor:'pointer', fontSize:'14px', color:'#64748b' },
  tabActive: { background:'#3b82f6', color:'#fff', border:'1px solid #3b82f6' },
  blockBtn:  { padding:'7px 14px', color:'#fff', border:'none',
               borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'500' },
  deleteBtn: { padding:'7px 14px', background:'#ef4444', color:'#fff', border:'none',
               borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'500' },
};
