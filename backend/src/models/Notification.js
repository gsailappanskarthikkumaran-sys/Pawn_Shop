import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    referenceId: { type: String },
    referenceType: { type: String },
    read: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
