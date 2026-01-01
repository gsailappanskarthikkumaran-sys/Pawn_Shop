import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Phone, Info, Home } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="navbar">
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

            <div className="navbar-actions">
                <button
                    className="nav-icon-btn"
                    onClick={() => navigate('/notifications')}
                    title="Notifications"
                >
                    <Bell size={20} />
                    <span className="notification-badge"></span>
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
