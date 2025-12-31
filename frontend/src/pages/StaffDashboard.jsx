import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    DollarSign, FileText, CheckCircle, Clock, Calendar,
    ArrowUpRight, ArrowDownLeft, Wallet
} from 'lucide-react';
import './Dashboard.css'; // Reusing generic dashboard styles

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

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Staff Dashboard</h1>
                    <p>Overview for <span className="highlight-user">{user?.fullName}</span> (Staff)</p>
                </div>
                <div className="date-badge">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* TODAY'S SUMMARY */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-700">Today's Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="stat-card bg-blue-50 border-blue-100">
                        <div className="stat-icon bg-blue-100 text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div className="stat-info">
                            <p>Loans Issued</p>
                            <h3>{stats?.today?.loansCount || 0}</h3>
                            <span className="text-sm text-slate-500">${stats?.today?.loansAmount || 0} disbursed</span>
                        </div>
                    </div>

                    <div className="stat-card bg-green-50 border-green-100">
                        <div className="stat-icon bg-green-100 text-green-600">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="stat-info">
                            <p>Payments Received</p>
                            <h3>${stats?.today?.paymentsReceived || 0}</h3>
                            <span className="text-sm text-slate-500">Collected today</span>
                        </div>
                    </div>

                    <div className="stat-card bg-orange-50 border-orange-100">
                        <div className="stat-icon bg-orange-100 text-orange-600">
                            <Clock size={24} />
                        </div>
                        <div className="stat-info">
                            <p>Pending Redemptions</p>
                            <h3>{stats?.today?.pendingRedemptions || 0}</h3>
                            <span className="text-sm text-slate-500">Due within 7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-700">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="panel-card p-6 flex flex-col items-center text-center">
                        <CheckCircle size={32} className="text-purple-500 mb-2" />
                        <h3 className="text-2xl font-bold text-slate-800">{stats?.stats?.activeLoans || 0}</h3>
                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Active Loans</p>
                    </div>

                    <div className="panel-card p-6 flex flex-col items-center text-center">
                        <Wallet size={32} className="text-emerald-500 mb-2" />
                        <h3 className="text-2xl font-bold text-slate-800">${stats?.stats?.outstandingAmount?.toLocaleString() || 0}</h3>
                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Total Outstanding</p>
                    </div>

                    <div className="panel-card p-6 flex flex-col items-center text-center">
                        <DollarSign size={32} className="text-amber-500 mb-2" />
                        <h3 className="text-2xl font-bold text-slate-800">${stats?.today?.interestCollected || 0}</h3>
                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Interest Today</p>
                    </div>

                </div>
            </div>

            {/* COMMON ACTIONS */}
            <div className="panel-card quick-actions">
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
            </div>
        </div>
    );
};

export default StaffDashboard;
