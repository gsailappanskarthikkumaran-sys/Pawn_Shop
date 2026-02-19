import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './Layout.css';

const Layout = () => {
 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const onNavigate = () => {
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`app-layout ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="layout-body">
                <Sidebar isOpen={isSidebarOpen} onNavigate={onNavigate} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
