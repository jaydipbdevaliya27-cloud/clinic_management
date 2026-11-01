const router = require('express').Router();
const auth = require('../middleware/auth');
const Dietary = require('../models/Dietary');

// GET /api/dietary?clinicId=xxx
router.get('/', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        if (!clinicId) return res.status(400).json({ message: 'clinicId required' });
        const items = await Dietary.find({ clinicId }).lean();
        // Return as map: { code: { code, text } }
        const map = {};
        for (const item of items) map[item.code] = { code: item.code, text: item.text };
        res.json(map);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/dietary
router.post('/', auth, async (req, res) => {
    try {
        const { clinicId, code, text } = req.body;
        if (!clinicId || !code || !text) return res.status(400).json({ message: 'clinicId, code and text required' });
        await Dietary.findOneAndUpdate(
            { clinicId, code },
            { $set: { text } },
            { upsert: true, new: true }
        );
        res.status(201).json({ code, text });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/dietary/:code?clinicId=xxx
router.delete('/:code', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        await Dietary.findOneAndDelete({ clinicId, code: req.params.code });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
