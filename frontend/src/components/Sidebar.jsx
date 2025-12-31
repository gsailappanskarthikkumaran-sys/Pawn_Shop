import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    Banknote,
    Gem,
    FileText,
    Settings,
    LogOut,
    Receipt,
    Book,
    Bell,
    Gavel
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
        { name: 'Pledge Entry', path: '/pledge', icon: <Gem size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
        { name: 'Payments', path: '/payments', icon: <Banknote size={20} /> },
        { name: 'Loans List', path: '/loans', icon: <FileText size={20} /> },
        { name: 'Accounts', path: '/accounts', icon: <Book size={20} /> },
        { name: 'Auctions', path: '/auctions', icon: <Gavel size={20} /> },
        { name: 'Vouchers', path: '/vouchers', icon: <Receipt size={20} /> },
        { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
        ...(isAdmin ? [
            { name: 'Masters', path: '/masters', icon: <Settings size={20} /> },
            { name: 'Staff', path: '/staff', icon: <Users size={20} /> }
        ] : []),
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="brand-icon">
                    <Gem size={22} color="#0f172a" strokeWidth={2.5} />
                </div>
                <div className="brand-info">
                    <h1>GoldLend</h1>
                    <p>Management System</p>
                </div>
            </div>

            <div className="nav-menu">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="icon-wrapper">
                                {item.icon}
                            </div>
                            <span className="nav-label">{item.name}</span>
                            {isActive && (
                                <div className="active-indicator"></div>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                        <p>{user?.fullName}</p>
                        <p>{user?.role}</p>
                    </div>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
