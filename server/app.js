import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { UPLOAD_DIR } from './config/cloudinary.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import requestRoutes from './routes/requests.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

// The Express app on its own: server.js runs it locally, api/index.js runs it on Vercel.
const app = express();
// CLIENT_URL may list several origins, comma-separated (e.g. the Vercel domain and localhost)
const origin = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean);

app.set('trust proxy', 1); // Vercel terminates HTTPS at a proxy in front of the app
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

export default app;
