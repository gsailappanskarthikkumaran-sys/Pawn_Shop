import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE', 'UPDATE', 'DELETE', 
            'CREATE_CUSTOMER', 'UPDATE_CUSTOMER', 'DELETE_CUSTOMER',
            'CREATE_LOAN', 'UPDATE_LOAN', 'CLOSE_LOAN', 'DELETE_LOAN',
            'CREATE_PAYMENT', 'UPDATE_PAYMENT', 'DELETE_PAYMENT',
            'LOGIN', 'LOGOUT'
        ]
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Customer', 'Loan', 'Payment', 'User', 'System']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() { return this.entityType !== 'System'; } // System events might not have a specific entity ID
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Sometimes actor might be system itself, initially keeping false
    },
    actorName: {
        type: String,
        required: false
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Can store objects, strings, arrays
        description: 'Details of what changed (old vs new values)'
    },
    ipAddress: {
        type: String
    }
}, { timestamps: true });

// Optional: Indexing for faster queries since we'll query by entity a lot
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
