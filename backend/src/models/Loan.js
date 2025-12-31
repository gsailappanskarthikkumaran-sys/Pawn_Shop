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
    totalPurity: { // Average purity or just informative
        type: String,
    },
    goldRateAtPledge: {
        type: Number,
        required: true, // Rate per gram used for calculation
    },
    valuation: {
        type: Number,
        required: true, // Total value of pledged gold
    },
    loanAmount: {
        type: Number,
        required: true, // Actual loan given
    },
    interestRate: { // Snapshot of interest rate at time of loan
        type: Number,
        required: true,
    },
    loanDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    currentBalance: { // To track remaining principal/interest
        type: Number,
        default: 0
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
    }
}, {
    timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
