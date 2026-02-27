import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const notifyAdminsAndStaff = async ({ title, message, type, branch, referenceId, referenceType }) => {
    try {
       
        const admins = await User.find({ role: 'admin', isActive: true });

        let staff = [];
        if (branch) {
            staff = await User.find({
                role: 'staff',
                branch: branch,
                isActive: true
            });
        }

     
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
