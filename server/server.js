import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { UPLOAD_DIR } from './config/cloudinary.js';
import { notFound, errorHandler } from './middleware/error.js';
import { supabase } from './supabaseServer.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import requestRoutes from './routes/requests.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const app = express();
const server = http.createServer(app);
// CLIENT_URL may list several origins, comma-separated (e.g. the Vercel domain and localhost)
const origin = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean);

// ---- Socket.io: real-time chat
const io = new Server(server, { cors: { origin } });
app.set('io', io);

io.use((socket, next) => {
  try {
    const { id } = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = id;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  // client asks to join a conversation room; we check they belong to it
  socket.on('conversation:join', async (conversationId) => {
    const { data } = await supabase.from('conversations').select('id')
      .eq('id', conversationId).contains('participants', [socket.userId]).maybeSingle();
    if (data) socket.join(`conv:${conversationId}`);
  });
});

// ---- Express
app.set('trust proxy', 1); // hosts like Render terminate HTTPS at a proxy in front of the app
app.use(helmet());
app.use(cors({ origin }));
app.use(express.json());
app.use(morgan('dev'));

// Locally stored images (used when Cloudinary is not configured); allow the client origin to load them
app.use('/uploads', (_req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
