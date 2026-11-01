const mongoose = require('mongoose');

const PrescriptionItemSchema = new mongoose.Schema({
    name: String, qty: String,
    mor: String, noon: String, eve: String, ngt: String,
}, { _id: false });

const TreatmentItemSchema = new mongoose.Schema({
    name: String, qty: String,
}, { _id: false });

const VisitSchema = new mongoose.Schema({
    clinicId: { type: String, required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    patientCode: { type: String },
    familyCode: { type: String },
    caseId: { type: String },
    visitNum: { type: Number, default: 1 },
    date: { type: String },   // ISO date string "YYYY-MM-DD"
    time: { type: String },
    weight: { type: String, default: '' },
    bp: { type: String, default: '' },
    refDr: { type: String, default: '' },
    complaint: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    treatment: { type: [TreatmentItemSchema], default: [] },
    prescription: { type: [PrescriptionItemSchema], default: [] },
    charge: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', VisitSchema);
