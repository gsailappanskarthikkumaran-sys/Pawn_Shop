import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
    schemeName: {
        type: String,
        required: true,
        unique: true,
    },
    interestMonths: {
        m1: { type: Number, required: true },
        m2: { type: Number, required: true },
        m3: { type: Number, required: true },
        m4: { type: Number, required: true },
        m5: { type: Number, required: true },
        m6: { type: Number, required: true },
        m7: { type: Number, required: true },
        m8: { type: Number, required: true },
        m9: { type: Number, required: true },
        m10: { type: Number, required: true },
        m11: { type: Number, required: true },
        m12: { type: Number, required: true },
        afterValidity: { type: Number, required: true }
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
