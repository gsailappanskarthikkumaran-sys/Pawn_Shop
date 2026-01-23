import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    aadharNumber: { type: String },
    panNumber: { type: String },
    photo: {
        type: String,
    },
    aadharCard: { type: String },
    panCard: { type: String },

    idProof: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    fatherName: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'trans'] },
    maritalStatus: { type: String, enum: ['single', 'married'] },
    nominee: { type: String },
    city: { type: String },
    pincode: { type: String },
    state: { type: String, default: 'Tamil Nadu' }
}, {
    timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
