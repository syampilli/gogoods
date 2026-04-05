import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user }    = useAuth();
  const socketRef   = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => {
    if (!user) {
      // User logout అయితే socket disconnect
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Connect
    socketRef.current = io(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);
    const socket = socketRef.current;

    socket.on('connect', () => {
      // Personal room join
      socket.emit('join', user.id);
    });

    // Notification వచ్చినప్పుడు
    socket.on('notification', (notif) => {
      setNotifications(prev => {
        // Duplicate avoid
        if (prev.find(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(c => c + 1);
      toast(notif.message, {
        icon: notif.type === 'chat' ? '💬' : '📦',
        duration: 5000,
        style: { maxWidth: '380px' }
      });
    });

    // New order available — drivers కి
    socket.on('new_order_available', () => {
      if (user.role === 'driver') {
        toast('🔔 New delivery job available!', { duration: 4000 });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Existing notifications load
  useEffect(() => {
    if (!user) return;
    import('../api/axios').then(({ default: API }) => {
      API.get('/notifications')
        .then(r => {
          setNotifications(r.data);
          setUnreadCount(r.data.filter(n => !n.read).length);
        })
        .catch(() => {});
    });
  }, [user]);

  const markAllRead = async () => {
    try {
      const API = (await import('../api/axios')).default;
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      notifications,
      unreadCount,
      markAllRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);