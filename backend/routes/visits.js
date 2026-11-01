const router = require('express').Router();
const auth = require('../middleware/auth');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Counter = require('../models/Counter');
const { pad, makeCaseId } = require('../utils/helpers');

// Helper: get counter
async function getCounter(clinicId) {
    let c = await Counter.findOne({ clinicId });
    if (!c) c = await Counter.create({ clinicId });
    return c;
}

// POST /api/visits — add visit for a patient
router.post('/', auth, async (req, res) => {
    try {
        const { clinicId, patientCode, familyCode, ...visitData } = req.body;
        if (!clinicId || !patientCode || !familyCode) return res.status(400).json({ message: 'clinicId, patientCode, familyCode required' });

        const pat = await Patient.findOne({ clinicId, patientCode });
        if (!pat) return res.status(404).json({ message: 'Patient not found' });
        const fam = await Family.findOne({ clinicId, familyCode });
        if (!fam) return res.status(404).json({ message: 'Family not found' });

        const counter = await getCounter(clinicId);

        // Count existing visits for this patient for visitNum
        const vCount = await Visit.countDocuments({ clinicId, patientId: pat._id });
        const visitNum = vCount + 1;
        const caseId = makeCaseId(familyCode, patientCode, visitNum);

        const visit = await Visit.create({
            clinicId,
            patientId: pat._id,
            familyId: fam._id,
            patientCode,
            familyCode,
            caseId,
            visitNum,
            ...visitData,
        });

        counter.visit += 1;
        await counter.save();

        res.status(201).json({
            visit: {
                _id: visit._id.toString(),
                id: visit._id.toString(),
                caseId, visitNum,
                date: visit.date, time: visit.time,
                weight: visit.weight, bp: visit.bp,
                refDr: visit.refDr, complaint: visit.complaint, diagnosis: visit.diagnosis,
                treatment: visit.treatment, prescription: visit.prescription,
                charge: visit.charge, received: visit.received, due: visit.due,
            },
            counters: { family: counter.family, patient: counter.patient, visit: counter.visit },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/visits/:id — update visit
router.patch('/:id', auth, async (req, res) => {
    try {
        const visit = await Visit.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!visit) return res.status(404).json({ message: 'Visit not found' });
        res.json({ message: 'Updated', visit });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
