const mongoose = require('mongoose');

// Tracks the next available counter for each clinic (family, patient, visit)
const CounterSchema = new mongoose.Schema({
    clinicId: { type: String, required: true, unique: true },
    family: { type: Number, default: 1 },
    patient: { type: Number, default: 1 },
    visit: { type: Number, default: 1 },
});

module.exports = mongoose.model('Counter', CounterSchema);
