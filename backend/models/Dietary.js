const mongoose = require('mongoose');

const DietarySchema = new mongoose.Schema({
    clinicId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    text: { type: String, required: true },
});

DietarySchema.index({ clinicId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Dietary', DietarySchema);
