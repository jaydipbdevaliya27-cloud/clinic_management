const router = require('express').Router();
const auth = require('../middleware/auth');
const Family = require('../models/Family');
const Patient = require('../models/Patient');
const Counter = require('../models/Counter');
const Visit = require('../models/Visit');
const { pad } = require('../utils/helpers');

// Helper: get counter
async function getCounter(clinicId) {
    let c = await Counter.findOne({ clinicId });
    if (!c) c = await Counter.create({ clinicId });
    return c;
}

// POST /api/patients — add member to existing family
router.post('/', auth, async (req, res) => {
    try {
        const { clinicId, familyCode, name, relation, age, bloodGroup, allergy } = req.body;
        if (!clinicId || !familyCode || !name) return res.status(400).json({ message: 'clinicId, familyCode and name required' });

        const fam = await Family.findOne({ clinicId, familyCode });
        if (!fam) return res.status(404).json({ message: 'Family not found' });

        const counter = await getCounter(clinicId);
        const patCode = pad(counter.patient, 4);

        const pat = await Patient.create({
            clinicId, familyId: fam._id, familyCode,
            patientCode: patCode, name, relation, age, bloodGroup, allergy,
        });

        counter.patient += 1;
        await counter.save();

        res.status(201).json({
            patient: {
                _id: pat._id.toString(), id: patCode,
                familyId: fam._id.toString(), name, relation, age, bloodGroup, allergy, visits: [],
            },
            counters: { family: counter.family, patient: counter.patient, visit: counter.visit },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/patients/:patientCode?clinicId=xxx — update patient info
router.patch('/:patientCode', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        const pat = await Patient.findOneAndUpdate(
            { clinicId, patientCode: req.params.patientCode },
            { $set: req.body },
            { new: true }
        );
        if (!pat) return res.status(404).json({ message: 'Patient not found' });
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/patients/:patientCode?clinicId=xxx
router.delete('/:patientCode', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        const pat = await Patient.findOne({ clinicId, patientCode: req.params.patientCode });
        if (!pat) return res.status(404).json({ message: 'Patient not found' });
        await Visit.deleteMany({ patientId: pat._id });
        await Patient.findByIdAndDelete(pat._id);
        res.json({ message: 'Patient deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
