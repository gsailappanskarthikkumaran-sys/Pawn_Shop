import mongoose from 'mongoose';

const goldRateSchema = new mongoose.Schema({
    rateDate: {
        type: Date,
        required: true,
        unique: true, // Only one rate per day usually
    },
    ratePerGram22k: {
        type: Number,
        required: true,
    },
    ratePerGram24k: {
        type: Number,
        required: true,
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
