import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Socket event వచ్చినప్పుడు మరియు
 * ప్రతి `intervalMs` milliseconds కి callback run చేస్తుంది
 */
export function useAutoRefresh(callback, intervalMs = 10000) {
  const { socket } = useSocket();
  const callbackRef = useRef(callback);

  // Always latest callback ref లో ఉండాలి
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Initial load
    callbackRef.current();

    // Polling — every intervalMs
    const interval = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    // Socket events వచ్చినప్పుడు instant refresh
    const handleOrderUpdate = () => callbackRef.current();

    socket?.on('order_updated',       handleOrderUpdate);
    socket?.on('notification',        handleOrderUpdate);
    socket?.on('driver_assigned',     handleOrderUpdate);
    socket?.on('status_changed',      handleOrderUpdate);

    return () => {
      clearInterval(interval);
      socket?.off('order_updated',    handleOrderUpdate);
      socket?.off('notification',     handleOrderUpdate);
      socket?.off('driver_assigned',  handleOrderUpdate);
      socket?.off('status_changed',   handleOrderUpdate);
    };
  }, [socket, intervalMs]);
}