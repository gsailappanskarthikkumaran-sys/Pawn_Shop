import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
    schemeName: {
        type: String,
        required: true,
        unique: true,
    },
    interestRate: {
        type: Number, // Percentage per month
        required: true,
    },
    tenureMonths: {
        type: Number,
        required: true,
    },
    maxLoanPercentage: { // Max loan amount as % of gold value
        type: Number,
        required: true,
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
