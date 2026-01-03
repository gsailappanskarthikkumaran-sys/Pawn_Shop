import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StaffDashboard from './StaffDashboard';
import api from '../api/axios';
import {
    DollarSign, FileText, Users, AlertTriangle, TrendingUp, Calendar, ArrowRight,
    PieChart as PieIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    useEffect(() => {
        if (user?.role !== 'staff') {
            fetchBranches();
            fetchDashboardStats();
        }
    }, [user, selectedBranch]);

    const fetchBranches = async () => {
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches", error);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const { data } = await api.get('/loans/stats/dashboard', {
                params: { branch: selectedBranch }
            });
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load stats", error);
            setLoading(false);
        }
    };


    if (user?.role === 'staff') {
        return <StaffDashboard />;
    }


    const COLORS = ['#ca8a04', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">Loading Analytics...</div>
            </div>
        );
    }
    const monthlyData = stats?.monthlyTrend?.length ? stats.monthlyTrend : [
        { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 }
    ];
    const schemeData = stats?.schemeStats?.length ? stats.schemeStats : [
        { name: 'No Data', value: 1 }
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Dashboard</h1>
                    <p>Welcome back, <span className="highlight-user">{user?.fullName}</span></p>
                </div>
                <div className="dashboard-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user?.role !== 'staff' && (
                        <div className="branch-select-container">
                            <select
                                className="branch-select"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="date-badge">
                        <Calendar size={14} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue-icon"><FileText size={24} /></div>
                    <div className="stat-info">
                        <p>Total Loans</p>
                        <h3>{stats?.counts?.total || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green-icon"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <p>Outstanding</p>
                        <h3>₹{stats?.financials?.outstanding?.toLocaleString() || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple-icon"><Users size={24} /></div>
                    <div className="stat-info">
                        <p>Active Pledges</p>
                        <h3>{stats?.counts?.active || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red-icon"><AlertTriangle size={24} /></div>
                    <div className="stat-info">
                        <p>Overdue</p>
                        <h3>{stats?.counts?.overdue || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon gray-icon"><FileText size={24} /></div>
                    <div className="stat-info">
                        <p>Closed Pledges</p>
                        <h3>{stats?.counts?.closed || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple-icon"><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <p>Interest Today</p>
                        <h3>₹{stats?.financials?.interestToday?.toLocaleString() || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="panel-card chart-panel">
                    <div className="panel-header">
                        <div className="panel-title">
                            <TrendingUp size={20} className="text-primary" />
                            <h2>Loan Disbursal Trend</h2>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ca8a04" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value} `} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#ca8a04" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="panel-card pie-panel">
                    <div className="panel-header">
                        <div className="panel-title">
                            <PieIcon size={20} className="text-primary" />
                            <h2>Scheme Distribution</h2>
                        </div>
                    </div>
                    <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={schemeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {schemeData.map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                {/* Recent Activity Section */}
                <div className="panel-card activity-section">
                    <div className="panel-header">
                        <div className="panel-title">
                            <FileText className="text-primary" size={20} color="#ca8a04" />
                            <h2>Recent Loans</h2>
                        </div>
                        <button className="view-all-btn">
                            View All <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="activity-list">
                        {stats?.recentLoans?.map((loan) => (
                            <div key={loan._id} className="activity-item">
                                <div className="activity-left">
                                    <div className="activity-avatar">
                                        {loan.loanId.slice(-3)}
                                    </div>
                                    <div className="activity-meta">
                                        <p>{loan.customer?.name}</p>
                                        <p className="activity-time">
                                            <span className={`status - dot ${loan.status === 'closed' ? 'bg-slate-400' : 'bg-green-500'} `}></span>
                                            {new Date(loan.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="activity-amount">
                                    <span>₹{loan.loanAmount}</span>
                                    <span style={{ textTransform: 'uppercase' }}>{loan.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="panel-card quick-actions">
                    <div className="panel-header">
                        <h2 className="panel-title">Quick Actions</h2>
                    </div>
                    <div className="action-grid">
                        <div className="action-card yellow-action" onClick={() => window.location.href = '/pledge'}>
                            <span>New Pledge</span>
                            <span className="plus-icon-circle">+</span>
                        </div>
                        <div className="action-card blue-action" onClick={() => window.location.href = '/customers/add'}>
                            <span>Add Customer</span>
                            <Users size={18} />
                        </div>
                        <div className="action-card green-action" onClick={() => window.location.href = '/payments'}>
                            <span>Record Payment</span>
                            <DollarSign size={18} />
                        </div>
                        <div className="action-card" onClick={() => window.location.href = '/masters'}>
                            <span>Check Gold Rates</span>
                            <TrendingUp size={18} />
                        </div>
                        <div className="action-card" onClick={() => window.location.href = '/vouchers'}>
                            <span>Voucher Entry</span>
                            <FileText size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
