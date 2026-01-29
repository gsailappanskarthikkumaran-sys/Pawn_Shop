import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Book, TrendingUp, TrendingDown, Calendar, FileText, PieChart, Printer, PlusCircle, Save, IndianRupee } from 'lucide-react';
import './Accounts.css';

const Accounts = () => {

    const [activeTab, setActiveTab] = useState('daybook');
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayBookData, setDayBookData] = useState({ transactions: [], summary: {} });
    const [financials, setFinancials] = useState(null);

    useEffect(() => {
        if (activeTab === 'daybook' || activeTab === 'ledger') {
            fetchDayBook();
        } else if (activeTab === 'financials') {
            fetchFinancials();
        } else if (activeTab === 'business') {
            fetchBusiness();
        } else if (activeTab === 'demand') {
            fetchDemand();
        }
    }, [activeTab, selectedDate]);

    const fetchDayBook = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/reports/day-book?date=${selectedDate}`);
            setDayBookData(data);
        } catch (error) {
            console.error("Error fetching day book", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/reports/financials');
            setFinancials(data);
        } catch (error) {
            console.error("Error fetching financials", error);
        } finally {
            setLoading(false);
        }
    };


    const [businessData, setBusinessData] = useState(null);
    const [demandData, setDemandData] = useState([]);

    const fetchBusiness = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/reports/business');
            setBusinessData(data);
        } catch (error) {
            console.error("Error fetching business report", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDemand = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/reports/demand?days=30');
            setDemandData(data);
        } catch (error) {
            console.error("Error fetching demand report", error);
        } finally {
            setLoading(false);
        }
    };


    const [voucherForm, setVoucherForm] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleVoucherSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/vouchers', voucherForm);
            alert('Ledger Entry Added Successfully!');
            setVoucherForm(prev => ({ ...prev, amount: '', description: '', category: '' }));
            fetchDayBook();
        } catch (error) {
            console.error("Error adding voucher", error);
            alert('Failed to add ledger entry');
        } finally {
            setLoading(false);
        }
    };

    const renderTransactionTable = () => (
        <div className="t-tbl">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th className="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                    ) : dayBookData.transactions?.length === 0 ? (
                        <tr><td colSpan="5" className="text-center">No transactions for this date.</td></tr>
                    ) : (
                        dayBookData.transactions?.map((t, idx) => (
                            <tr key={idx}>
                                <td>{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>
                                    <span className={`badge ${t.type === 'CREDIT' ? 'badge-success' : 'badge-danger'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td>{t.category}</td>
                                <td>{t.description}</td>
                                <td className={`text-right font-bold ${t.type === 'CREDIT' ? 'text-green' : 'text-red'}`}>
                                    {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="accounts-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Accounts & Reports</h1>
                    <p>Financial overview, day book, and statements</p>
                </div>
            </div>


            <div className="tabs-header">
                <button
                    className={`tab-btn ${activeTab === 'daybook' ? 'active' : ''}`}
                    onClick={() => setActiveTab('daybook')}
                >
                    <Book size={18} /> Day Book
                </button>
                <button
                    className={`tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financials')}
                >
                    <PieChart size={18} /> Financials & P&L
                </button>
                <button
                    className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
                    onClick={() => setActiveTab('business')}
                >
                    <TrendingUp size={18} /> Business Report
                </button>
                <button
                    className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
                    onClick={() => setActiveTab('demand')}
                >
                    <TrendingDown size={18} /> Demand List
                </button>
                <button
                    className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ledger')}
                >
                    <PlusCircle size={18} /> Ledger Entry
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'daybook' && (
                    <div className="daybook-view">
                        <div className="date-picker-bar">
                            <label><Calendar size={18} /> Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <button className="btn-refresh" onClick={fetchDayBook}>Load</button>
                            <button
                                className="btn-refresh"
                                style={{ backgroundColor: '#475569', marginLeft: '10px' }}
                                onClick={() => window.open(`/print/day-book/${selectedDate}`, '_blank')}
                            >
                                <Printer size={16} /> Print
                            </button>
                        </div>

                        <div className="summary-cards">
                            <div className="mini-card green">
                                <span>Money In</span>
                                <h3>+₹{dayBookData.summary?.totalIn?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="mini-card red">
                                <span>Money Out</span>
                                <h3>-₹{dayBookData.summary?.totalOut?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="mini-card blue">
                                <span>Net Change</span>
                                <h3>₹{dayBookData.summary?.netChange?.toLocaleString() || 0}</h3>
                            </div>
                        </div>


                        {renderTransactionTable()}
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="financials-view">
                        {loading ? <p>Loading Financials...</p> : (
                            <>

                                <div className="balance-sheet-card main-cash-card">
                                    <div className="icon-circle"><IndianRupee size={32} /></div>
                                    <div className="info">
                                        <h2>Cash In Hand (Net)</h2>
                                        <div className="big-amount">₹{financials?.balanceSheet?.assets?.cashInHand?.toLocaleString()}</div>
                                        <p>Calculated as (Total In - Total Out)</p>
                                    </div>
                                </div>

                                <div className="reports-grid">

                                    <div className="report-card">
                                        <div className="card-header-sm">
                                            <h3>Balance Sheet</h3>
                                        </div>
                                        <div className="report-row">
                                            <span>Outstanding Loans (Principal)</span>
                                            <span>₹{financials?.balanceSheet?.assets?.outstandingLoans?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row">
                                            <span>Cash Asset</span>
                                            <span>₹{financials?.balanceSheet?.assets?.cashInHand?.toLocaleString()}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="report-row total">
                                            <span>Total Assets</span>
                                            <span>₹{(financials?.balanceSheet?.assets?.outstandingLoans + financials?.balanceSheet?.assets?.cashInHand).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="report-card">
                                        <div className="card-header-sm">
                                            <h3>Cash Flow Statement</h3>
                                        </div>
                                        <div className="report-row success">
                                            <span>Loan Repayments Received</span>
                                            <span>+₹{financials?.profitAndLoss?.income?.loanRepayments?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row success">
                                            <span>Other Income</span>
                                            <span>+₹{financials?.profitAndLoss?.income?.otherIncome?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row danger">
                                            <span>Loans Issued</span>
                                            <span>-₹{financials?.profitAndLoss?.expenses?.loansIssued?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row danger">
                                            <span>Operating Expenses</span>
                                            <span>-₹{financials?.profitAndLoss?.expenses?.operatingExpenses?.toLocaleString()}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="report-row total">
                                            <span>Net Cash Flow</span>
                                            <span className={financials?.profitAndLoss?.netCashFlow >= 0 ? 'text-green' : 'text-red'}>
                                                ₹{financials?.profitAndLoss?.netCashFlow?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'business' && (
                    <div className="financials-view">
                        {loading ? <p>Loading Business Report...</p> : (
                            <div className="reports-grid">
                                <div className="report-card">
                                    <div className="card-header-sm">
                                        <h3>Loan Portfolio Valuation</h3>
                                    </div>
                                    <div className="report-row">
                                        <span>Principal Outstanding</span>
                                        <span>₹{businessData?.loanPortfolio?.principalOutstanding?.toLocaleString()}</span>
                                    </div>
                                    <div className="report-row">
                                        <span>Total Disbursed (Lifetime)</span>
                                        <span>₹{businessData?.loanPortfolio?.totalDisbursed?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="report-card">
                                    <div className="card-header-sm">
                                        <h3>Revenue & Cash</h3>
                                    </div>
                                    <div className="report-row success">
                                        <span>Interest Revenue</span>
                                        <span>₹{businessData?.revenue?.interestCollected?.toLocaleString()}</span>
                                    </div>
                                    <div className="report-row">
                                        <span>Net Cash Position</span>
                                        <span>₹{businessData?.cashPosition?.cashInHand?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'demand' && (
                    <div className="daybook-view">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-sm flex-1 mr-4">
                                Showing loans overdue or maturing within the next 30 days.
                            </div>
                            <button
                                onClick={() => window.open('/print/report-demand/all', '_blank')}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 font-bold"
                            >
                                <Printer size={18} /> Print List
                            </button>
                        </div>
                        {loading ? <p>Loading Demand List...</p> : (
                            <div className="t-tbl">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Loan ID</th>
                                            <th>Customer</th>
                                            <th>Maturity Date</th>
                                            <th>Status</th>
                                            <th className="text-right">Balance</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demandData.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center">No demands generated.</td></tr>
                                        ) : demandData.map((loan) => (
                                            <tr key={loan._id}>
                                                <td className="font-mono">{loan.loanId}</td>
                                                <td>
                                                    <div>{loan.customer?.name}</div>
                                                    <div className="text-xs text-gray-500">{loan.customer?.phone}</div>
                                                </td>
                                                <td>
                                                    {new Date(loan.maturityDate).toLocaleDateString('en-IN')}
                                                    {new Date(loan.maturityDate) < new Date() &&
                                                        <span className="ml-2 text-xs text-red-600 font-bold">(EXPIRED)</span>
                                                    }
                                                </td>
                                                <td><span className={`badge status-${loan.status}`}>{loan.status}</span></td>
                                                <td className="text-right font-bold">₹{loan.balance}</td>
                                                <td>
                                                    <button className="text-blue-600 hover:underline text-xs" onClick={() => window.open(`/print/loan/${loan._id}`, '_blank')}>
                                                        Print Notice
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <div className="daybook-view">
                        <div className="tally-container">

                            <div className="tally-header">
                                <div className="tally-header-left">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#854d0e', textTransform: 'uppercase' }}>Voucher Type</span>
                                        <select
                                            className="tally-select"
                                            style={{ padding: '0', fontSize: '1.2rem', background: 'transparent', width: 'auto' }}
                                            value={voucherForm.type}
                                            onChange={e => setVoucherForm({ ...voucherForm, type: e.target.value })}
                                        >
                                            <option value="expense">Payment / Expense</option>
                                            <option value="income">Receipt / Income</option>
                                            <option value="Contra">Contra</option>
                                            <option value="Journal">Journal</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Purchase">Purchase</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#854d0e', textTransform: 'uppercase' }}>Date</span>
                                        <input
                                            type="date"
                                            style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: '#451a03', outline: 'none' }}
                                            value={voucherForm.date}
                                            onChange={e => {
                                                const newDate = e.target.value;
                                                setVoucherForm({ ...voucherForm, date: newDate });
                                                setSelectedDate(newDate);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="tally-header-right">
                                    <span style={{ fontWeight: 'bold' }}>No: Auto</span>
                                </div>
                            </div>


                            <div className="tally-body">
                                <table className="tally-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>Dr/Cr</th>
                                            <th>Particulars</th>
                                            <th style={{ textAlign: 'right', width: '150px' }}>Debit</th>
                                            <th style={{ textAlign: 'right', width: '150px' }}>Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        <tr>
                                            <td className="tally-dr-cr">
                                                {['expense', 'Purchase'].includes(voucherForm.type) ? 'Dr' : 'Cr'}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="tally-input"
                                                    placeholder="Particulars (e.g. Rent, Salary, Tea Exp)"
                                                    value={voucherForm.category}
                                                    onChange={e => setVoucherForm({ ...voucherForm, category: e.target.value })}
                                                    required
                                                    autoFocus
                                                />
                                            </td>

                                            {['expense', 'Purchase'].includes(voucherForm.type) ? (
                                                <>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <input
                                                            type="number"
                                                            className="tally-input"
                                                            style={{ textAlign: 'right' }}
                                                            value={voucherForm.amount}
                                                            onChange={e => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td style={{ textAlign: 'right', background: '#f8fafc' }}></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ textAlign: 'right', background: '#f8fafc' }}></td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <input
                                                            type="number"
                                                            className="tally-input"
                                                            style={{ textAlign: 'right' }}
                                                            value={voucherForm.amount}
                                                            onChange={e => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                </>
                                            )}
                                        </tr>


                                        <tr>
                                            <td className="tally-dr-cr">
                                                {['expense', 'Purchase'].includes(voucherForm.type) ? 'Cr' : 'Dr'}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="tally-input"
                                                    value="Cash / Bank Account"
                                                    readOnly
                                                    style={{ color: '#64748b' }}
                                                />
                                            </td>
                                            {['expense', 'Purchase'].includes(voucherForm.type) ? (
                                                <>
                                                    <td style={{ textAlign: 'right', background: '#f8fafc' }}></td>
                                                    <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold' }}>
                                                        {voucherForm.amount || '0.00'}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold' }}>
                                                        {voucherForm.amount || '0.00'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', background: '#f8fafc' }}></td>
                                                </>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                            <div className="tally-footer">
                                <div className="narration-container">
                                    <label className="narration-label">Narration:</label>
                                    <textarea
                                        className="narration-box"
                                        placeholder="Enter narration here..."
                                        value={voucherForm.description}
                                        onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="tally-actions" style={{ justifyContent: 'center' }}>
                                    <button className="btn-secondary" onClick={() => setVoucherForm({ ...voucherForm, amount: '', description: '', category: '' })}>Clear</button>
                                    <button className="btn-primary" onClick={handleVoucherSubmit} disabled={loading}>
                                        <Save size={18} /> {loading ? 'Saving...' : 'Accept (Save)'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#64748b' }}>Transactions for {new Date(selectedDate).toLocaleDateString('en-IN')}</h3>
                            {renderTransactionTable()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accounts;
