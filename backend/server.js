const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

// CORS — Vercel URL తర్వాత add చేస్తాం
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  FRONTEND_URL=https://gogoods-rho.vercel.app
  process.env.FRONTEND_URL,  // Vercel URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin:  allowedOrigins,
    methods: ['GET','POST','PUT','DELETE']
  }
});

app.set('io', io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/wallet',        require('./routes/wallet'));
app.use('/api/promo',         require('./routes/promo'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/profile',       require('./routes/profile'));

app.get('/', (req, res) =>
  res.json({ message: 'GoGoods API running!' })
);

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`order_${data.orderId}`).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.log('DB Error:', err));
