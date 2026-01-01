import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content-wrapper">
                <Navbar />
                <div className="main-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
