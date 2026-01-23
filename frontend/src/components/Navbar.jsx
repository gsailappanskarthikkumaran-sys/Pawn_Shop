import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Phone, Info, Home, Menu } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../api/axios';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user) return;
            try {
                const { data } = await api.get('/notifications');
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                console.error("Error fetching unread count", error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="navbar">
            <div className="navbar-brand">

                <img src={logo} alt="Mahes Bankers Logo" className="navbar-logo" />
                <span className="navbar-company-name">MAHES BANKERS</span>

                <button className="menu-toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
                    <Menu size={24} />
                </button>
            </div>

            <div className="n-lnks">
                <div className="navbar-links">
                    <Link to="/" className="nav-link">
                        <Home size={18} />
                        <span>Home</span>
                    </Link>
                    <Link to="/contact" className="nav-link">
                        <Phone size={18} />
                        <span>Contact</span>
                    </Link>
                    <Link to="/about" className="nav-link">
                        <Info size={18} />
                        <span>About Us</span>
                    </Link>
                </div>
            </div>

            <div className="navbar-actions">
                <button
                    className="nav-icon-btn"
                    onClick={() => navigate('/notifications')}
                    title="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                <div className="user-profile-nav">
                    <div className="user-avatar-small">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="user-name">{user?.fullName}</span>
                </div>

                <button onClick={logout} className="logout-btn-nav" title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
