const router = require('express').Router();
const auth = require('../middleware/auth');
const Family = require('../models/Family');
const Patient = require('../models/Patient');
const Counter = require('../models/Counter');
const Visit = require('../models/Visit');
const { pad } = require('../utils/helpers');

// Helper: get or create counter for a clinic
async function getCounter(clinicId) {
    let counter = await Counter.findOne({ clinicId });
    if (!counter) counter = await Counter.create({ clinicId });
    return counter;
}

// GET /api/families?clinicId=xxx  — returns full nested DB shape for frontend
router.get('/', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        if (!clinicId) return res.status(400).json({ message: 'clinicId required' });

        const families = await Family.find({ clinicId }).lean();
        const patients = await Patient.find({ clinicId }).lean();
        const visits = await Visit.find({ clinicId }).lean();
        const counter = await getCounter(clinicId);

        // Build the nested structure the frontend expects:
        // { counters, dietary: {}, families: { "0001": { id, headName, area, phone, patients: { "0001": { ...pat, visits: [] } } } } }
        const famMap = {};
        for (const fam of families) {
            famMap[fam.familyCode] = {
                _id: fam._id.toString(),
                id: fam.familyCode,
                headName: fam.headName,
                area: fam.area,
                phone: fam.phone,
                createdAt: fam.createdAt,
                patients: {},
            };
        }

        const patMap = {}; // patientCode -> { ...pat, visits: [] }
        for (const pat of patients) {
            const patObj = {
                _id: pat._id.toString(),
                id: pat.patientCode,
                familyId: pat.familyId.toString(),
                name: pat.name,
                relation: pat.relation,
                age: pat.age,
                bloodGroup: pat.bloodGroup,
                allergy: pat.allergy,
                visits: [],
            };
            patMap[pat._id.toString()] = patObj;
            if (famMap[pat.familyCode]) {
                famMap[pat.familyCode].patients[pat.patientCode] = patObj;
            }
        }

        for (const v of visits) {
            const patObj = patMap[v.patientId.toString()];
            if (patObj) {
                patObj.visits.push({
                    _id: v._id.toString(),
                    id: v._id.toString(),
                    caseId: v.caseId,
                    visitNum: v.visitNum,
                    date: v.date,
                    time: v.time,
                    weight: v.weight,
                    bp: v.bp,
                    refDr: v.refDr,
                    complaint: v.complaint,
                    diagnosis: v.diagnosis,
                    treatment: v.treatment,
                    prescription: v.prescription,
                    charge: v.charge,
                    received: v.received,
                    due: v.due,
                });
            }
        }

        res.json({
            counters: { family: counter.family, patient: counter.patient, visit: counter.visit },
            families: famMap,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/families — create family + head patient
router.post('/', auth, async (req, res) => {
    try {
        const { clinicId, headName, area, phone } = req.body;
        if (!clinicId || !headName) return res.status(400).json({ message: 'clinicId and headName required' });

        const counter = await getCounter(clinicId);
        const famCode = pad(counter.family, 4);
        const patCode = pad(counter.patient, 4);

        const fam = await Family.create({ clinicId, headName, area, phone, familyCode: famCode });
        const pat = await Patient.create({
            clinicId, familyId: fam._id, familyCode: famCode,
            patientCode: patCode, name: headName, relation: 'Head',
        });

        counter.family += 1;
        counter.patient += 1;
        await counter.save();

        res.status(201).json({
            family: { _id: fam._id.toString(), id: famCode, headName, area, phone, createdAt: fam.createdAt },
            patient: { _id: pat._id.toString(), id: patCode, name: headName, relation: 'Head', age: '', bloodGroup: '', allergy: '', visits: [] },
            counters: { family: counter.family, patient: counter.patient, visit: counter.visit },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/families/:familyCode?clinicId=xxx
router.delete('/:familyCode', auth, async (req, res) => {
    try {
        const { clinicId } = req.query;
        const { familyCode } = req.params;
        const fam = await Family.findOne({ clinicId, familyCode });
        if (!fam) return res.status(404).json({ message: 'Family not found' });

        const patients = await Patient.find({ familyId: fam._id });
        for (const pat of patients) {
            await Visit.deleteMany({ patientId: pat._id });
        }
        await Patient.deleteMany({ familyId: fam._id });
        await Family.findByIdAndDelete(fam._id);

        res.json({ message: 'Family deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
