import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Book, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, PieChart } from 'lucide-react';
import './Accounts.css';

const Accounts = () => {
    // Tabs: 'daybook', 'financials'
    const [activeTab, setActiveTab] = useState('daybook');
    const [loading, setLoading] = useState(true);

    // Day Book Data
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayBookData, setDayBookData] = useState({ transactions: [], summary: {} });

    // Financial Data
    const [financials, setFinancials] = useState(null);

    useEffect(() => {
        if (activeTab === 'daybook') {
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

    // Business & Demand Data
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

    return (
        <div className="accounts-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Accounts & Reports</h1>
                    <p>Financial overview, day book, and statements</p>
                </div>
            </div>

            {/* Tabs */}
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
                        </div>

                        {/* Day Summary Cards */}
                        <div className="summary-cards">
                            <div className="mini-card green">
                                <span>Money In</span>
                                <h3>+${dayBookData.summary?.totalIn?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="mini-card red">
                                <span>Money Out</span>
                                <h3>-${dayBookData.summary?.totalOut?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="mini-card blue">
                                <span>Net Change</span>
                                <h3>${dayBookData.summary?.netChange?.toLocaleString() || 0}</h3>
                            </div>
                        </div>

                        {/* Transaction Table */}
                        <div className="transactions-table-container">
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
                                                    {t.type === 'CREDIT' ? '+' : '-'}${t.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="financials-view">
                        {loading ? <p>Loading Financials...</p> : (
                            <>
                                {/* Cash Position */}
                                <div className="balance-sheet-card main-cash-card">
                                    <div className="icon-circle"><DollarSign size={32} /></div>
                                    <div className="info">
                                        <h2>Cash In Hand (Net)</h2>
                                        <div className="big-amount">${financials?.balanceSheet?.assets?.cashInHand?.toLocaleString()}</div>
                                        <p>Calculated as (Total In - Total Out)</p>
                                    </div>
                                </div>

                                <div className="reports-grid">
                                    {/* ASSETS / BALANCE SHEET */}
                                    <div className="report-card">
                                        <div className="card-header-sm">
                                            <h3>Balance Sheet</h3>
                                        </div>
                                        <div className="report-row">
                                            <span>Outstanding Loans (Principal)</span>
                                            <span>${financials?.balanceSheet?.assets?.outstandingLoans?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row">
                                            <span>Cash Asset</span>
                                            <span>${financials?.balanceSheet?.assets?.cashInHand?.toLocaleString()}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="report-row total">
                                            <span>Total Assets</span>
                                            <span>${(financials?.balanceSheet?.assets?.outstandingLoans + financials?.balanceSheet?.assets?.cashInHand).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* P&L / CASH FLOW */}
                                    <div className="report-card">
                                        <div className="card-header-sm">
                                            <h3>Cash Flow Statement</h3>
                                        </div>
                                        <div className="report-row success">
                                            <span>Loan Repayments Received</span>
                                            <span>+${financials?.profitAndLoss?.income?.loanRepayments?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row success">
                                            <span>Other Income</span>
                                            <span>+${financials?.profitAndLoss?.income?.otherIncome?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row danger">
                                            <span>Loans Issued</span>
                                            <span>-${financials?.profitAndLoss?.expenses?.loansIssued?.toLocaleString()}</span>
                                        </div>
                                        <div className="report-row danger">
                                            <span>Operating Expenses</span>
                                            <span>-${financials?.profitAndLoss?.expenses?.operatingExpenses?.toLocaleString()}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="report-row total">
                                            <span>Net Cash Flow</span>
                                            <span className={financials?.profitAndLoss?.netCashFlow >= 0 ? 'text-green' : 'text-red'}>
                                                ${financials?.profitAndLoss?.netCashFlow?.toLocaleString()}
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
                                        <span>${businessData?.loanPortfolio?.principalOutstanding?.toLocaleString()}</span>
                                    </div>
                                    <div className="report-row">
                                        <span>Total Disbursed (Lifetime)</span>
                                        <span>${businessData?.loanPortfolio?.totalDisbursed?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="report-card">
                                    <div className="card-header-sm">
                                        <h3>Revenue & Cash</h3>
                                    </div>
                                    <div className="report-row success">
                                        <span>Interest Revenue</span>
                                        <span>${businessData?.revenue?.interestCollected?.toLocaleString()}</span>
                                    </div>
                                    <div className="report-row">
                                        <span>Net Cash Position</span>
                                        <span>${businessData?.cashPosition?.cashInHand?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'demand' && (
                    <div className="daybook-view">
                        <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-4 text-sm">
                            Showing loans overdue or maturing within the next 30 days.
                        </div>
                        {loading ? <p>Loading Demand List...</p> : (
                            <div className="transactions-table-container">
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
                                                    {new Date(loan.maturityDate).toLocaleDateString()}
                                                    {new Date(loan.maturityDate) < new Date() &&
                                                        <span className="ml-2 text-xs text-red-600 font-bold">(EXPIRED)</span>
                                                    }
                                                </td>
                                                <td><span className={`badge status-${loan.status}`}>{loan.status}</span></td>
                                                <td className="text-right font-bold">${loan.balance}</td>
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
            </div>
        </div>
    );
};

export default Accounts;
