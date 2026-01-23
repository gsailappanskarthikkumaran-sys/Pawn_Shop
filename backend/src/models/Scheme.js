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
    penalInterestRate: {
        type: Number,
        default: 0, // Extra interest % per annum (e.g. 3%)
    },
    overdueFine: {
        type: Number,
        default: 0, // Flat fine amount (e.g. 500)
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
