import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // If null, could mean 'All Admins' or similar, but let's be specific for now
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    referenceId: { type: String }, // e.g., Loan ID or Customer ID
    referenceType: { type: String }, // 'Loan', 'Customer'
    read: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
