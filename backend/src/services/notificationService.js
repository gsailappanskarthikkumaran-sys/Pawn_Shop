import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Sends notifications to appropriate recipients based on branch and role.
 * Admins always receive everything.
 * Staff receive notifications related to their branch.
 */
export const notifyAdminsAndStaff = async ({ title, message, type, branch, referenceId, referenceType }) => {
    try {
        // Fetch all active admins
        const admins = await User.find({ role: 'admin', isActive: true });

        let staff = [];
        if (branch) {
            // Fetch all active staff in the specific branch
            staff = await User.find({
                role: 'staff',
                branch: branch,
                isActive: true
            });
        }

        // Combine and unique recipients
        const recipients = [...admins, ...staff];
        const uniqueRecipients = Array.from(new Set(recipients.map(r => r._id.toString())))
            .map(id => recipients.find(r => r._id.toString() === id));

        const notifications = uniqueRecipients.map(recipient => ({
            recipient: recipient._id,
            title,
            message,
            type: type || 'info',
            branch: branch || null,
            targetRole: recipient.role,
            referenceId,
            referenceType
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error('Error sending multi-notifications:', error);
    }
};
