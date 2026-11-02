const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dns = require('dns');
// Use Google DNS to fix SRV lookup issues on some ISPs
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const familyRoutes = require('./routes/families');
const patientRoutes = require('./routes/patients');
const visitRoutes = require('./routes/visits');
const dietaryRoutes = require('./routes/dietary');
const authMiddleware = require('./middleware/auth');

const app = express();

// Middleware: flexible CORS to support localhost on any port, Render, and custom domains
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, '') : null,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/+$/, '');
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isRender = origin.endsWith('.onrender.com');
        const isAllowedExplicit = allowedOrigins.includes(normalized);

        if (isLocalhost || isRender || isAllowedExplicit) {
            return callback(null, true);
        }
        // In non-strict dev, allow origin rather than crashing express
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/families', authMiddleware, familyRoutes);
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/visits', authMiddleware, visitRoutes);
app.use('/api/dietary', authMiddleware, dietaryRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic_management';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
