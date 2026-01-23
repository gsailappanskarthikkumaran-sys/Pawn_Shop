import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, Check, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="icon-warning" size={20} />;
            case 'success': return <CheckCircle className="icon-success" size={20} />;
            case 'error': return <AlertTriangle className="icon-error" size={20} />;
            default: return <Info className="icon-info" size={20} />;
        }
    };

    if (loading) return <div className="p-8">Loading Notifications...</div>;

    return (
        <div className="n-cnt">
            <div className="page-header">
                <div className="page-title">
                    <h1>Notifications</h1>
                    <p>Alerts and updates</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button className="mark-all-btn" onClick={markAllRead}>
                        <Check size={16} /> Mark All Read
                    </button>
                )}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} className="text-gray-300 mb-4" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map((note) => (
                        <div key={note._id} className={`notification-card ${note.read ? 'read' : 'unread'} ${note.type}`}>
                            <div className="note-icon">
                                {getIcon(note.type)}
                            </div>
                            <div className="note-content">
                                <h3>{note.title}</h3>
                                <p>{note.message}</p>
                                <span className="note-time">
                                    {new Date(note.createdAt).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {!note.read && (
                                <button className="mark-read-btn" onClick={() => markAsRead(note._id)} title="Mark as read">
                                    <div className="dot"></div>
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
