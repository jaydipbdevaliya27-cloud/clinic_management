require('dotenv').config();
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

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,  // Set this on Render to your frontend service URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
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
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
