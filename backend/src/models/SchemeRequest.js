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
        interestRate: { type: Number, required: true },
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
