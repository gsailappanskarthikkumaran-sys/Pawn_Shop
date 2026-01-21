import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    DollarSign, FileText, CheckCircle, Clock, Calendar,
    ArrowUpRight, ArrowDownLeft, Wallet
} from 'lucide-react';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/loans/stats/staff-dashboard');
            setStats(data);
        } catch (error) {
            console.error("Error fetching staff stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="staff-dashboard-container">Loading Dashboard...</div>;

    return (
        <div className="staff-dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Staff Dashboard</h1>
                    <p>Overview for <span className="highlight-user">{user?.fullName}</span> (Staff)</p>
                </div>
                <div className="date-badge">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>


            <div className="staff-section">
                <h2 className="staff-section-title">Today's Summary</h2>
                <div className="staff-stats-grid">

                    <div className="staff-stat-card">
                        <div className="staff-stat-icon icon-blue">
                            <FileText size={24} />
                        </div>
                        <div className="staff-stat-info">
                            <p>Loans Issued</p>
                            <h3>{stats?.today?.loansCount || 0}</h3>
                            <span className="staff-stat-subtext">₹{stats?.today?.loansAmount || 0} disbursed</span>
                        </div>
                    </div>

                    <div className="staff-stat-card">
                        <div className="staff-stat-icon icon-green">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="staff-stat-info">
                            <p>Payments Received</p>
                            <h3>₹{stats?.today?.paymentsReceived || 0}</h3>
                            <span className="staff-stat-subtext">Collected today</span>
                        </div>
                    </div>

                    <div className="staff-stat-card">
                        <div className="staff-stat-icon icon-orange">
                            <Clock size={24} />
                        </div>
                        <div className="staff-stat-info">
                            <p>Pending Redemptions</p>
                            <h3>{stats?.today?.pendingRedemptions || 0}</h3>
                            <span className="staff-stat-subtext">Due within 7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="staff-section">
                <h2 className="staff-section-title">Quick Stats</h2>
                <div className="staff-stats-grid">

                    <div className="staff-panel-card">
                        <CheckCircle size={32} className="text-purple" />
                        <h3>{stats?.stats?.activeLoans || 0}</h3>
                        <p className="staff-panel-label">Active Loans</p>
                    </div>

                    <div className="staff-panel-card">
                        <Wallet size={32} className="text-emerald" />
                        <h3>₹{stats?.stats?.outstandingAmount?.toLocaleString() || 0}</h3>
                        <p className="staff-panel-label">Total Outstanding</p>
                    </div>

                    <div className="staff-panel-card">
                        <DollarSign size={32} className="text-amber" />
                        <h3>₹{stats?.today?.interestCollected || 0}</h3>
                        <p className="staff-panel-label">Interest Today</p>
                    </div>

                </div>
            </div>

            {/* <div className="panel-card quick-actions">
                <div className="panel-header">
                    <h2 className="panel-title">Staff Actions</h2>
                </div>
                <div className="action-grid">
                    <div className="action-card yellow-action" onClick={() => window.location.href = '/pledge'}>
                        <span>Create New Pledge</span>
                        <span className="plus-icon-circle">+</span>
                    </div>
                    <div className="action-card green-action" onClick={() => window.location.href = '/payments'}>
                        <span>Collect Payment</span>
                        <DollarSign size={18} />
                    </div>
                    <div className="action-card blue-action" onClick={() => window.location.href = '/customers'}>
                        <span>Manage Customers</span>
                        <FileText size={18} />
                    </div>
                    <div className="action-card" onClick={() => window.location.href = '/vouchers'}>
                        <span>Expense/Voucher</span>
                        <DollarSign size={18} />
                    </div>
                </div> 
            </div>*/}
        </div>
    );
};

export default StaffDashboard;
