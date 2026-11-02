/**
 * seed.js — Run once to populate MongoDB with demo data for Dhyey Clinic.
 * Usage: node seed.js
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Family = require('./models/Family');
const Patient = require('./models/Patient');
const Visit = require('./models/Visit');
const Dietary = require('./models/Dietary');
const Counter = require('./models/Counter');

const CLINIC_ID = 'demo';
const TODAY = new Date().toISOString().slice(0, 10);

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean existing demo data
    await Promise.all([
        Doctor.deleteOne({ username: 'dhyey' }),
        Family.deleteMany({ clinicId: CLINIC_ID }),
        Patient.deleteMany({ clinicId: CLINIC_ID }),
        Visit.deleteMany({ clinicId: CLINIC_ID }),
        Dietary.deleteMany({ clinicId: CLINIC_ID }),
        Counter.deleteOne({ clinicId: CLINIC_ID }),
    ]);

    // Create demo doctor (password is "123", will be hashed by pre-save hook)
    await Doctor.create({
        username: 'dhyey',
        password: '123',
        clinics: [{ id: CLINIC_ID, name: 'Dhyey Clinic' }],
        activeClinicId: CLINIC_ID,
    });

    // Dietary advice
    await Dietary.insertMany([
        { clinicId: CLINIC_ID, code: 'DB', text: 'Diabetic diet: avoid sugar, sweets and fried food. Prefer high-fibre meals, eat on time.' },
        { clinicId: CLINIC_ID, code: 'CV', text: 'Low-salt, low-oil diet. Avoid red meat and packaged/processed food.' },
        { clinicId: CLINIC_ID, code: 'LQ', text: 'Plenty of fluids and light, easily digestible food until fever/cough settles.' },
    ]);

    // Families / patients
    const familiesData = [
        {
            familyCode: '0001', headName: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', phone: '9876543210',
            patients: [
                { patientCode: '0001', name: 'PATEL RAMESHBHAI GOVINDBHAI', relation: 'Head', age: '45', bloodGroup: 'O+', allergy: '' },
                { patientCode: '0002', name: 'PATEL SHARDABEN RAMESHBHAI', relation: 'Wife', age: '43', bloodGroup: 'B+', allergy: 'DUST' },
            ],
        },
        {
            familyCode: '0002', headName: 'SHARMA AMITBHAI DINESHBHAI', area: 'NAVRANGPURA', phone: '9876543211',
            patients: [
                { patientCode: '0003', name: 'SHARMA AMITBHAI DINESHBHAI', relation: 'Head', age: '50', bloodGroup: 'A+', allergy: '' },
                { patientCode: '0004', name: 'SHARMA NEHABEN AMITBHAI', relation: 'Wife', age: '48', bloodGroup: 'A+', allergy: '' },
                { patientCode: '0005', name: 'SHARMA RAHUL AMITBHAI', relation: 'Son', age: '22', bloodGroup: 'AB+', allergy: '' },
            ],
        },
        {
            familyCode: '0003', headName: 'SHAH RAHULBHAI RAJENDRABHAI', area: 'SATELLITE', phone: '9876543212',
            patients: [
                { patientCode: '0006', name: 'SHAH RAHULBHAI RAJENDRABHAI', relation: 'Head', age: '38', bloodGroup: 'O+', allergy: '' },
                { patientCode: '0007', name: 'SHAH KINJALBEN RAHULBHAI', relation: 'Wife', age: '35', bloodGroup: 'O+', allergy: '' },
            ],
        },
        {
            familyCode: '0004', headName: 'DESAI SUNITABEN MAHESHBHAI', area: 'BOPAL', phone: '9876543213',
            patients: [
                { patientCode: '0008', name: 'DESAI SUNITABEN MAHESHBHAI', relation: 'Head', age: '60', bloodGroup: 'B+', allergy: 'PEANUTS' },
            ],
        },
        {
            familyCode: '0005', headName: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', phone: '9876543214',
            patients: [
                { patientCode: '0009', name: 'MEHTA VIKRAMBHAI SANJAYBHAI', relation: 'Head', age: '28', bloodGroup: 'AB-', allergy: '' },
                { patientCode: '0010', name: 'MEHTA SANJAYBHAI NATVERLAL', relation: 'Father', age: '62', bloodGroup: 'A+', allergy: '' },
            ],
        },
    ];

    // Sample visits per patient code
    const visitsData = {
        '0001': [{ date: TODAY, time: '10:15', weight: '75', bp: '130/80', refDr: 'Dr. Shah', diagnosis: 'Viral Infection', complaint: 'Cough and Cold', treatment: [{ name: 'Checkup', qty: '1' }], prescription: [{ name: 'Paracetamol', qty: '10', mor: '1', noon: '1', eve: '1', ngt: '0' }], charge: 800, received: 500, due: 300 }],
        '0004': [{ date: TODAY, time: '11:00', weight: '62', bp: '110/70', refDr: 'Self', diagnosis: 'Acidity', complaint: 'Stomach pain', treatment: [{ name: 'Consultation', qty: '1' }], prescription: [{ name: 'Pantoprazole', qty: '5', mor: '1', noon: '0', eve: '0', ngt: '0' }], charge: 400, received: 400, due: 0 }],
        '0007': [{ date: TODAY, time: '12:30', weight: '60', bp: '120/80', refDr: 'Self', diagnosis: 'Migraine', complaint: 'Headache', treatment: [{ name: 'Consultation', qty: '1' }], prescription: [{ name: 'Crocin', qty: '5', mor: '1', noon: '0', eve: '0', ngt: '0' }], charge: 600, received: 0, due: 600 }],
        '0009': [{ date: TODAY, time: '09:30', weight: '70', bp: '120/80', refDr: 'Self', diagnosis: 'Fever', complaint: 'Mild fever', treatment: [{ name: 'Consultation', qty: '1' }], prescription: [], charge: 500, received: 500, due: 0 }],
    };

    const patientMap = {}; // patientCode -> Patient doc

    for (const fd of familiesData) {
        const fam = await Family.create({ clinicId: CLINIC_ID, headName: fd.headName, area: fd.area, phone: fd.phone, familyCode: fd.familyCode });
        for (const pd of fd.patients) {
            const pat = await Patient.create({ clinicId: CLINIC_ID, familyId: fam._id, familyCode: fd.familyCode, ...pd });
            patientMap[pd.patientCode] = { pat, fam };
        }
    }

    // Insert visits
    for (const [patCode, visits] of Object.entries(visitsData)) {
        const { pat, fam } = patientMap[patCode];
        for (let i = 0; i < visits.length; i++) {
            const visitNum = i + 1;
            const caseId = fam.familyCode + pat.patientCode + String(visitNum).padStart(2, '0');
            await Visit.create({ clinicId: CLINIC_ID, patientId: pat._id, familyId: fam._id, patientCode: pat.patientCode, familyCode: fam.familyCode, caseId, visitNum, ...visits[i] });
        }
    }

    // Set counter past max used
    await Counter.create({ clinicId: CLINIC_ID, family: 6, patient: 11, visit: 5 });

    console.log('✅ Seed complete! Demo clinic data inserted.');
    process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
