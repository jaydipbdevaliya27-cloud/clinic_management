const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ClinicSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
});

const DoctorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    clinics: { type: [ClinicSchema], default: [] },
    activeClinicId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
DoctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

DoctorSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);
