import { createContext, useContext, useEffect, useRef, useState } from 'react';
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
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // ✅ Dynamic import — socket load fail అయినా app block కాదు
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        
        socketRef.current = io(socketUrl, {
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          timeout: 10000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
          socket.emit('join', user.id);
        });

        socket.on('connect_error', (err) => {
          // ✅ Socket error వచ్చినా app block కాదు — silently fail
          console.warn('Socket connection failed:', err.message);
        });

        socket.on('notification', (notif) => {
          setNotifications(prev => {
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

        socket.on('new_order_available', () => {
          if (user.role === 'driver') {
            toast('🔔 New delivery job available!', { duration: 4000 });
          }
        });

      } catch (err) {
        // ✅ Socket import fail అయినా app work చేస్తుంది
        console.warn('Socket init failed:', err);
      }
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    import('../api/axios').then(({ default: API }) => {
      API.get('/notifications')
        .then(r => {
          setNotifications(r.data);
          setUnreadCount(r.data.filter(n => !n.read).length);
        })
        .catch(() => {}); // ✅ Silently fail
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