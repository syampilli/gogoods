const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ Dynamic CORS (handles ALL vercel deployments 🔥)
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin || // Postman / mobile apps
      origin.includes("localhost") ||
      origin.includes("vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed: " + origin));
    }
  },
  credentials: true
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ FIXED Preflight (no crash)
app.options(/.*/, cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ Socket.io with same CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Socket CORS not allowed: " + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/promo', require('./routes/promo'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/profile', require('./routes/profile'));

// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: 'GoGoods API running!' });
});

// ✅ Socket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
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

// ✅ MongoDB + Server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.log('DB Error:', err));