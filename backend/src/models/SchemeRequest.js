import mongoose from 'mongoose';

const schemeRequestSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    originalSchemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheme',
        required: true
    },
    proposedValues: {
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
        tenureMonths: { type: Number, required: true },
        maxLoanPercentage: { type: Number } // Optional
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminComment: {
        type: String
    }
}, {
    timestamps: true
});

const SchemeRequest = mongoose.model('SchemeRequest', schemeRequestSchema);

export default SchemeRequest;
