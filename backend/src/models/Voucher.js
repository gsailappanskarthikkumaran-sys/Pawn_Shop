import mongoose from 'mongoose';

const voucherSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['expense', 'income', 'Payment', 'Receipt', 'Contra', 'Journal', 'Sales', 'Purchase', 'Memo'],
        required: true
    },
    category: {
        type: String, // e.g., 'Tea/Coffee', 'Salary', 'Stationery', 'Rent'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }
}, {
    timestamps: true
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
