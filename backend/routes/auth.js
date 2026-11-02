const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        let { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        username = String(username).trim();
        password = String(password).trim();

        const jwtSecret = process.env.JWT_SECRET || 'dhyey_clinic_super_secret_key_2024';
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

        // Admin check (case-insensitive username)
        if (username.toLowerCase() === 'admin' && password === 'admin') {
            const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: jwtExpiresIn });
            return res.json({ token, role: 'admin' });
        }

        const doctor = await Doctor.findOne({ username: username.toLowerCase() });
        if (!doctor) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const match = await doctor.comparePassword(password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const activeClinicId = doctor.activeClinicId || (doctor.clinics && doctor.clinics[0]?.id) || 'demo';

        const profile = {
            id: doctor._id.toString(),
            _id: doctor._id.toString(),
            username: doctor.username,
            clinics: doctor.clinics || [],
            activeClinicId,
        };

        const token = jwt.sign(
            { role: 'doctor', doctorId: doctor._id.toString(), clinicId: activeClinicId },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        return res.json({ token, role: 'doctor', profile });
    } catch (err) {
        console.error('Auth login error:', err);
        return res.status(500).json({ message: 'Server error: ' + (err.message || 'unknown error') });
    }
});

module.exports = router;
