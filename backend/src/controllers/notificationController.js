import Notification from '../models/Notification.js';

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {

            if (notification.recipient.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            notification.read = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
};

export { getNotifications, markAsRead, markAllAsRead };
