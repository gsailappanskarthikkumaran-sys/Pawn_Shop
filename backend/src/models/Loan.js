import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    loanId: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    scheme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheme',
        required: true,
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
    }],
    totalWeight: {
        type: Number,
        required: true,
    },
    totalPurity: {
        type: String,
    },
    goldRateAtPledge: {
        type: Number,
        required: true,
    },
    valuation: {
        type: Number,
        required: true,
    },
    loanAmount: {
        type: Number,
        required: true,
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
    preInterestAmount: {
        type: Number,
        default: 0,
    },
    processingCharges: {
        type: Number,
        default: 0,
    },
    loanDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    nextPaymentDate: {
        type: Date,
        required: true,
    },
    paymentFrequency: {
        type: String,
        default: 'monthly',
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'overdue', 'auctioned'],
        default: 'active',
    },
    auctionDetails: {
        auctionDate: Date,
        auctionAmount: Number,
        bidderName: String,
        bidderContact: String,
        remarks: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    printCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;