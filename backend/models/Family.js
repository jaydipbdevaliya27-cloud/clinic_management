const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
    clinicId: { type: String, required: true, index: true },
    headName: { type: String, required: true },
    area: { type: String, default: '' },
    phone: { type: String, default: '' },
    familyCode: { type: String, required: true }, // padded 4-digit string like "0001"
    createdAt: { type: Date, default: Date.now },
});

FamilySchema.index({ clinicId: 1, familyCode: 1 }, { unique: true });

module.exports = mongoose.model('Family', FamilySchema);
