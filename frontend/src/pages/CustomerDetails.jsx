import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, User, Phone, MapPin, Printer, FileText, DollarSign, Calendar, Edit } from 'lucide-react';
import './CustomerDetails.css';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loans, setLoans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('loans');

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        try {

            const [custRes, loansRes] = await Promise.all([
                api.get(`/customers/${id}`),
                api.get('/loans')
            ]);

            setCustomer(custRes.data);

            const customerLoans = loansRes.data.filter(l =>
                (l.customer?._id === id) || (l.customer === id)
            );
            setLoans(customerLoans);
        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!customer) return <div className="p-8 text-center">Customer not found.</div>;

    const activeLoans = loans.filter(l => l.status !== 'closed');
    const closedLoans = loans.filter(l => l.status === 'closed');

    return (
        <div className="detail-container">

            <div className="detail-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} /> Back
                </button>
                <div className="header-actions">
                    <button
                        className="print-btn"
                        style={{ marginRight: '8px' }}
                        onClick={() => navigate(`/customers/edit/${customer._id}`)}
                    >
                        <Edit size={18} /> Edit
                    </button>
                    <button
                        className="print-btn"
                        onClick={() => window.open(`/print/customer/${customer._id}`, '_blank')}
                    >
                        <Printer size={18} /> Print Profile
                    </button>
                </div>
            </div>


            <div className="profile-card">
                <div className="profile-main">
                    <div className="avatar-large">
                        {customer.photo ?
                            <img src={`http://localhost:5000/${customer.photo}`} alt={customer.name} /> :
                            <User size={48} color="#cbd5e1" />
                        }
                    </div>
                    <div className="profile-info">
                        <h1>{customer.name}</h1>
                        <span className="id-badge">{customer.customerId}</span>
                        <div className="info-grid">
                            <div className="info-item">
                                <Phone size={16} /> {customer.phone}
                            </div>
                            <div className="info-item">
                                <MapPin size={16} /> {customer.city}, {customer.address}
                            </div>
                            <div className="info-item">
                                <Calendar size={16} /> Joined: {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            {customer.aadharNumber && (
                                <div className="info-item">
                                    <span className="font-bold text-xs" style={{ marginRight: '4px' }}>UID:</span> {customer.aadharNumber}
                                </div>
                            )}
                            {customer.panNumber && (
                                <div className="info-item">
                                    <span className="font-bold text-xs" style={{ marginRight: '4px' }}>PAN:</span> {customer.panNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="stat-box">
                        <label>Active Loans</label>
                        <div className="stat-value text-blue-600">{activeLoans.length}</div>
                    </div>
                    <div className="stat-box">
                        <label>Total Pledged</label>
                        <div className="stat-value text-green-600">
                            ₹{activeLoans.reduce((acc, curr) => acc + curr.loanAmount, 0)}
                        </div>
                    </div>
                </div>
            </div>


            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loans')}
                >
                    Loan History
                </button>
                <button
                    className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    Audit Log
                </button>
            </div>


            <div className="tab-content">
                {activeTab === 'loans' && (
                    <div className="loan-history-section">
                        <h3>Active Loans</h3>
                        {activeLoans.length === 0 ? <p className="text-gray-500">No active loans.</p> : (
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Loan ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeLoans.map(l => (
                                        <tr key={l._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/loans')}>
                                            <td className="font-mono">{l.loanId}</td>
                                            <td>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td className="font-bold">₹{l.loanAmount}</td>
                                            <td><span className={`status-pill status-${l.status}`}>{l.status}</span></td>
                                            <td className="text-sm text-gray-500">{l.totalWeight}g</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <h3 className="mt-8">Closed History</h3>
                        {closedLoans.length === 0 ? <p className="text-gray-500">No closed loans.</p> : (
                            <table className="detail-table opacity-75">
                                <thead>
                                    <tr>
                                        <th>Loan ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Closed On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {closedLoans.map(l => (
                                        <tr key={l._id}>
                                            <td className="font-mono">{l.loanId}</td>
                                            <td>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td>₹{l.loanAmount}</td>
                                            <td>{new Date(l.updatedAt).toLocaleDateString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="audit-section">
                        <p className="text-gray-500 italic">Audit logs (edits, deletions) will appear here in future updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;
