const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const { uid } = require('../utils/helpers');

// GET /api/admin/doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({}, '-password').lean();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/doctors
router.post('/doctors', async (req, res) => {
    try {
        let { username, password, clinicName } = req.body;
        if (!username || !password || !clinicName)
            return res.status(400).json({ message: 'All fields required' });

        username = String(username).trim();
        password = String(password).trim();
        clinicName = String(clinicName).trim();

        const exists = await Doctor.findOne({ username: username.toLowerCase() });
        if (exists) return res.status(409).json({ message: 'Username already exists' });

        const clinicId = uid();
        const doctor = new Doctor({
            username: username.toLowerCase(),
            password,
            clinics: [{ id: clinicId, name: clinicName }],
            activeClinicId: clinicId,
        });
        await doctor.save();

        const profile = {
            _id: doctor._id.toString(),
            id: doctor._id.toString(),
            username: doctor.username,
            clinics: doctor.clinics,
            activeClinicId: doctor.activeClinicId,
        };
        res.status(201).json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/doctors/:id
router.delete('/doctors/:id', async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
