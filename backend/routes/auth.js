const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: 'Username and password required' });

        // Admin hardcoded check
        if (username === 'admin' && password === 'admin') {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            return res.json({ token, role: 'admin' });
        }

        const doctor = await Doctor.findOne({ username: username.toLowerCase() });
        if (!doctor) return res.status(401).json({ message: 'Invalid username or password' });

        const match = await doctor.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid username or password' });

        const profile = {
            id: doctor._id.toString(),
            username: doctor.username,
            clinics: doctor.clinics,
            activeClinicId: doctor.activeClinicId,
        };

        const token = jwt.sign(
            { role: 'doctor', doctorId: doctor._id.toString(), clinicId: doctor.activeClinicId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token, role: 'doctor', profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
