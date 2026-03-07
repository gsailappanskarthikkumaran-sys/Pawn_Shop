import mongoose from 'mongoose';

const goldRateSchema = new mongoose.Schema({
    rateDate: {
        type: Date,
        required: true,
        unique: true,
    },
    ratePerGram22k: {
        type: Number,
    },
    ratePerGram20k: {
        type: Number,
    },
    ratePerGram18k: {
        type: Number,
    },
    deduction22k: {
        type: Number,
        default: 0
    },
    deductionOrdinary: {
        type: Number,
        default: 0
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

const GoldRate = mongoose.model('GoldRate', goldRateSchema);

export default GoldRate;
