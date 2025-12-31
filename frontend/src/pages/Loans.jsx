import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, FileText, ChevronRight, Printer } from 'lucide-react';
import './Loans.css';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await api.get('/loans');
            setLoans(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLoans = loans.filter(loan =>
        loan.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="loans-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Loan Accounts</h1>
                    <p>View and manage all active pledges</p>
                </div>
            </div>

            <div className="loans-card">
                <div className="card-toolbar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by Loan ID or Customer Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="loans-table">
                        <thead>
                            <tr>
                                <th>Loan ID</th>
                                <th>Customer</th>
                                <th>Scheme</th>
                                <th>Interest</th>
                                <th>Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Result</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading loans...</td></tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No loans found.</td></tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr key={loan._id}>
                                        <td><span className="loan-id">{loan.loanId}</span></td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{loan.customer?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.customer?.phone}</div>
                                        </td>
                                        <td>{loan.scheme?.schemeName}</td>
                                        <td>{loan.interestRate}%</td>
                                        <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                                        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                                        <td className="amount-cell">₹{loan.loanAmount}</td>
                                        <td style={{ color: '#64748b' }}>₹{loan.valuation}</td>
                                        <td>
                                            <span className={`status-badge status-${loan.status}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="action-icon-btn"
                                                title="Print Receipt"
                                                onClick={() => window.open(`/print/loan/${loan._id}`, '_blank')}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button
                                                className="action-arrow-btn"
                                                onClick={() => window.open(`/print/loan/${loan._id}`, '_blank')}
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Loans;
