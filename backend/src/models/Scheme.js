import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
    schemeName: {
        type: String,
        required: true,
        unique: true,
    },
    interestRate: {
        type: Number,
        required: true,
    },
    tenureMonths: {
        type: Number,
        required: true,
    },
    maxLoanPercentage: {
        type: Number,
        required: true,
    },
    preInterestMonths: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
