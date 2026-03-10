import AuditLog from '../models/AuditLog.js';

// Reusable function to create an audit log from other controllers
export const createAuditLog = async ({
    action,
    entityType,
    entityId,
    actor,
    actorName,
    details,
    ipAddress
}) => {
    try {
        const log = new AuditLog({
            action,
            entityType,
            entityId,
            actor,
            actorName,
            details,
            ipAddress
        });
        await log.save();
        return log;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We usually don't want audit logging failures to crash the main request
    }
};

// @desc    Get all audit logs for a specific entity
// @route   GET /api/audit-logs/:entityType/:entityId
// @access  Private
export const getAuditLogsByEntity = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        
        const logs = await AuditLog.find({ entityType, entityId })
            .sort({ createdAt: -1 })
            .populate('actor', 'name role'); // Optional, populate if actor is a User ref

        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs by entity:', error);
        res.status(500).json({ message: 'Server error while fetching audit logs' });
    }
};

// @desc    Get all audit logs (for admin/reporting)
// @route   GET /api/audit-logs
// @access  Private/Admin
export const getAllAuditLogs = async (req, res) => {
    try {
        // Simple pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const startIndex = (page - 1) * limit;

        const total = await AuditLog.countDocuments();

        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit)
            .populate('actor', 'name role');

        res.json({
            count: logs.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        console.error('Error fetching all audit logs:', error);
        res.status(500).json({ message: 'Server error while fetching audit logs' });
    }
};
