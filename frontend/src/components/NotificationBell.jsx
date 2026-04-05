import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Package, MessageCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button onClick={() => { setOpen(!open); if (open === false) markAllRead(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center
                   bg-gray-100 dark:bg-gray-800 hover:bg-gray-200
                   dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                           bg-red-500 text-white text-[10px] font-bold rounded-full
                           flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900
                        rounded-2xl shadow-2xl border border-gray-100
                        dark:border-gray-700 overflow-hidden z-50">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-blue-600 dark:text-blue-400
                             hover:underline flex items-center gap-1">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n._id || i}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800
                              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                              ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center
                                    justify-center
                                    ${n.type==='chat'
                                      ? 'bg-purple-100 dark:bg-purple-900/30'
                                      : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {n.type === 'chat'
                        ? <MessageCircle size={14} className="text-purple-600 dark:text-purple-400"/>
                        : <Package size={14} className="text-blue-600 dark:text-blue-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900
                                   dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400
                                   leading-relaxed mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full
                                      flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}