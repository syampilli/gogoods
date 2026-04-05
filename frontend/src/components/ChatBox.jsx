import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';

export default function ChatBox({ order, onClose }) {
  const { user }   = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef();

  const otherName = user?.role === 'vendor'
    ? (order?.driver?.name || 'Driver')
    : (order?.vendor?.name || 'Vendor');

  useEffect(() => {
    if (!order?._id) return;

    // Load existing messages
    API.get(`/chat/${order._id}`).then(r => setMessages(r.data));

    // Join order room
    socket?.emit('join_order', order._id);

    // Listen for new messages
    const handler = (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket?.on('receive_message', handler);

    return () => socket?.off('receive_message', handler);
  }, [order?._id, socket]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msgData = {
      orderId:    order._id,
      text:       text.trim(),
      senderName: user.name,
      senderRole: user.role,
      senderId:   user.id,
      createdAt:  new Date().toISOString(),
    };

    // Emit via socket (real-time)
    socket?.emit('send_message', msgData);

    // Save to DB
    try {
      const { data } = await API.post('/chat', msgData);
      setMessages(prev => [...prev, data]);
    } catch {
      setMessages(prev => [...prev, { ...msgData, _id: Date.now() }]);
    }
    setText('');
  };

  const timeStr = (date) => new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed bottom-6 right-6 w-80 z-50 shadow-2xl rounded-2xl
                    overflow-hidden border border-gray-200 dark:border-gray-700">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={14} />
          </div>
          <div>
            <p className="text-sm font-bold">{otherName}</p>
            <p className="text-[10px] text-blue-200">
              Order #{order?._id?.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center
                       justify-center transition-colors">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center
                       justify-center transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2
                          bg-white dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  No messages yet.<br/>Start the conversation!
                </p>
              </div>
            )}
            {messages.map((m, i) => {
              const isMe = m.senderId === user.id ||
                           m.sender?.toString() === user.id;
              return (
                <div key={m._id || i}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMe
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                  } px-3 py-2`}>
                    {!isMe && (
                      <p className="text-[10px] font-bold text-blue-600
                                   dark:text-blue-400 mb-0.5 capitalize">
                        {m.senderName} · {m.senderRole}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <p className={`text-[10px] mt-1
                      ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {timeStr(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900
                          border-t border-gray-100 dark:border-gray-700">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700 rounded-xl
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition-all"
            />
            <button onClick={sendMessage}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white
                         rounded-xl flex items-center justify-center
                         transition-colors flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}