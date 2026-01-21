import { useState } from 'react';
import api from '../api/axios';
import { Search, DollarSign, Calendar, FileText, CheckCircle, Printer } from 'lucide-react';
import './Payments.css';

const Payments = () => {
    const [searchId, setSearchId] = useState('');
    const [loan, setLoan] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);


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
        try {

            const { data } = await api.get(`/loans/${searchId}`);
            setLoan(data);
            fetchHistory(searchId);
        } catch (error) {
            alert('Loan not found');
            console.error(error);
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
                    placeholder="Enter Loan ID to search..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search Loan'}
                </button>
            </form>

            {loan && (
                <div className="layout-grid">

                    <div className="details-card">
                        <div className="card-header-row">
                            <h3 className="card-title">Loan Details</h3>
                            <span className={`status-badge status-${loan.status}`}>
                                {loan.status}
                            </span>
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
                            <span className="detail-value">{loan.scheme?.schemeName} ({loan.scheme?.interestRate}%)</span>
                        </div>

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
                                                setAmount(loan.currentBalance);
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
                                                <DollarSign size={20} />
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
