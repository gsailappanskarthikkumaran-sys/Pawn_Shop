import mongoose from 'mongoose';

const branchSchema = mongoose.Schema({
    branchId: {
        type: String,
        required: true,
        unique: true,
    },
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
