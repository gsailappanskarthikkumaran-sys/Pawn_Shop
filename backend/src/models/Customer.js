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
    }
}, {
    timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
