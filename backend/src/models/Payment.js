import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['interest', 'principal', 'full_settlement'],
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'online', 'bank_transfer'],
        default: 'cash',
        required: true
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    remarks: {
        type: String,
    }
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
