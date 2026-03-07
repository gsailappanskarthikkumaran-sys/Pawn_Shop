import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Calendar, FileText, CheckCircle, Printer, IndianRupee, RefreshCw } from 'lucide-react';
import './Payments.css';

const Payments = () => {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [loan, setLoan] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);


    const [amount, setAmount] = useState('');
    const [type, setType] = useState('interest');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId) return;

        if (searchId.trim().toUpperCase().startsWith('CUST-')) {
            alert("You have entered a Customer ID. Please enter a Loan ID (starts with 'LN-') to record a payment.");
            return;
        }

        setLoading(true);
        setLoan(null);
        setSearchResults([]);
        try {
            const { data } = await api.get(`/loans/${searchId}`);

            if (Array.isArray(data)) {
                setSearchResults(data);
            } else {
                setLoan(data);
                fetchHistory(data._id);
                if (data.calculatedInterest?.totalDue > 0) {
                    setAmount(data.calculatedInterest.totalDue.toFixed(2));
                    setType('interest');
                }
            }
        } catch (error) {
            alert('Loan or Customer not found');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectLoan = async (loanId) => {
        setLoading(true);
        setSearchResults([]);
        try {
            const { data } = await api.get(`/loans/${loanId}`);
            setLoan(data);
            fetchHistory(data._id);
            setSearchId(data.loanId);
            if (data.calculatedInterest?.totalDue > 0) {
                setAmount(data.calculatedInterest.totalDue.toFixed(2));
                setType('interest');
            }
        } catch (error) {
            alert('Failed to load loan details');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const { data } = await api.get(`/payments/loan/${id}`);
            setPayments(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/payments', {
                loanId: loan._id,
                amount: parseFloat(amount),

                type,
                paymentMode,
                paymentDate,
                remarks
            });
            alert('Payment Recorded Successfully!');
            setAmount('');
            setRemarks('');
            const loanRes = await api.get(`/loans/${loan._id}`);
            setLoan(loanRes.data);
            fetchHistory(loan._id);
        } catch (error) {
            alert(error.response?.data?.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="payments-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Payments</h1>
                    <p>Record interest and principal repayments</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="search-section">
                <Search size={24} color="#64748b" />
                <input
                    type="text"
                    className="search-input-lg"
                    placeholder="Search by Loan ID, Name, or Phone..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {searchResults.length > 0 && (
                <div className="search-results-list">
                    <h3 className="mb-3 text-sm font-bold text-gray-600 uppercase">Multiple Matches Found:</h3>
                    {searchResults.map((res) => (
                        <div key={res._id} className="search-result-item" onClick={() => selectLoan(res._id)}>
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <div className="font-bold text-blue-600">{res.loanId}</div>
                                    <div className="text-sm font-semibold">{res.customer?.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm">{res.customer?.phone}</div>
                                    <div className="text-xs text-gray-500">{res.scheme?.schemeName} | ₹{res.loanAmount}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loan && (
                <div className="layout-grid">

                    <div className="details-card">
                        <div className="card-header-row">
                            <h3 className="card-title">Loan Details</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {loan.status !== 'closed' && (
                                    <button 
                                        type="button"
                                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        onClick={() => navigate('/pledge', { state: { renewLoanId: loan._id } })}
                                    >
                                        <RefreshCw size={12} /> Renew / Top-up
                                    </button>
                                )}
                                <span className={`status-badge status-${loan.status}`}>
                                    {loan.status}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Customer</span>
                            <span className="detail-value">{loan.customer?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Loan Amount</span>
                            <span className="detail-value">₹{loan.loanAmount}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Balance</span>
                            <span className="detail-value text-red-600">₹{loan.currentBalance}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Scheme</span>
                            <span className="detail-value">{loan.scheme?.schemeName} ({loan.scheme?.interestMonths?.m1}% Start)</span>
                        </div>

                        {loan.calculatedInterest && loan.calculatedInterest.monthsUnpaid > 0 && (
                            <div className="detail-row" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', margin: '8px 0', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '100%' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-700">Accumulated Interest</span>
                                        <span className="font-bold text-blue-600">₹{loan.calculatedInterest.totalDue.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        Pending for {loan.calculatedInterest.monthsUnpaid} month(s)
                                    </div>
                                    <div style={{ display: 'grid', gap: '4px' }}>
                                        {loan.calculatedInterest.details.map((detail, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-gray-400">
                                                <span>Month {detail.month} ({detail.rate}%)</span>
                                                <span>₹{detail.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Penalty Display in User Interface */}
                        {loan.penalty && loan.penalty.amount > 0 && (
                            <div className="detail-row" style={{ background: '#fef2f2', padding: '8px', borderRadius: '4px', margin: '4px 0' }}>
                                <span className="detail-label text-red-600">Penalty / Overdue</span>
                                <span className="detail-value text-red-600">₹{loan.penalty.amount}</span>
                                <div style={{ width: '100%', fontSize: '0.75rem', color: '#ef4444' }}>
                                    {loan.penalty.details}
                                </div>
                            </div>
                        )}

                        {loan.status !== 'closed' && (
                            <form onSubmit={handlePayment} className="payment-form">
                                <h4 className="form-label mb-4" style={{ marginBottom: '12px', display: 'block' }}>New Payment</h4>

                                <div className="form-group">
                                    <label className="form-label">Payment Type</label>
                                    <select
                                        className="select-full"
                                        value={type}
                                        onChange={(e) => {
                                            setType(e.target.value);
                                            if (e.target.value === 'full_settlement') {
                                                const totalPayable = loan.payableAmount !== undefined ? loan.payableAmount : loan.currentBalance;
                                                setAmount(totalPayable);
                                            } else if (e.target.value === 'interest' && loan.calculatedInterest?.totalDue > 0) {
                                                // Auto-fill with the accumulated exact interest due
                                                setAmount(loan.calculatedInterest.totalDue.toFixed(2));
                                            } else {
                                                setAmount('');
                                            }
                                        }}
                                    >
                                        <option value="interest">Interest Payment</option>
                                        <option value="principal">Part Principal Payment</option>
                                        <option value="full_settlement">Full Settlement</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Mode</label>
                                    <select
                                        className="select-full"
                                        value={paymentMode}
                                        onChange={(e) => setPaymentMode(e.target.value)}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online / UPI</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        readOnly={type === 'full_settlement'}
                                        required
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Remarks</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Optional notes"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="btn-pay" disabled={submitting}>
                                    {submitting ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </form>
                        )}
                    </div>


                    <div className="history-card">
                        <div className="card-toolbar">
                            <h3 className="card-title" style={{ fontSize: '1rem' }}>Transaction History</h3>
                        </div>
                        <div className="history-list">
                            {payments.length === 0 ? (
                                <div className="empty-state">No payments recorded yet.</div>
                            ) : (
                                payments.map((p) => (
                                    <div key={p._id} className="payment-item">
                                        <div className="payment-left">
                                            <div className="payment-icon">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div className="payment-info">
                                                <h4>{p.type.replace('_', ' ')}</h4>
                                                <div className="payment-date">
                                                    <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                                    {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                                                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#94a3b8' }}>
                                                        ({p.paymentMode || 'cash'})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="payment-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="payment-amount text-green-600">
                                                +₹{p.amount}
                                            </div>
                                            <button
                                                onClick={() => window.open(`/print/payment/${p._id}`, '_blank')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                title="Print Receipt"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!loan && !loading && (
                <div className="empty-state" style={{ marginTop: '40px' }}>
                    <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <p>Search for a loan ID to make a payment</p>
                </div>
            )}
        </div>
    );
};

export default Payments;
