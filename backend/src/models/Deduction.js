import mongoose from 'mongoose';

const deductionSchema = new mongoose.Schema({
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

const Deduction = mongoose.model('Deduction', deductionSchema);

export default Deduction;
