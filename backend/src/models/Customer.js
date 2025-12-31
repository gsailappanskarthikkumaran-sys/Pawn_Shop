import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    photo: {
        type: String, // Path to stored image
    },
    idProof: {
        type: String, // Path to stored image
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
