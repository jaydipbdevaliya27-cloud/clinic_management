const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    clinicId: { type: String, required: true, index: true },
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    familyCode: { type: String, required: true },
    patientCode: { type: String, required: true }, // padded 4-digit string like "0003"
    name: { type: String, required: true },
    relation: { type: String, default: 'Head' },
    age: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    allergy: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

PatientSchema.index({ clinicId: 1, patientCode: 1 }, { unique: true });

module.exports = mongoose.model('Patient', PatientSchema);
