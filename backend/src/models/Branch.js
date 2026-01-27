import mongoose from 'mongoose';

const branchSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
