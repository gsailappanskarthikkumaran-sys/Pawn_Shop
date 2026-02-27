import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Gavel, Search, AlertCircle, CheckCircle } from 'lucide-react';
import './Auctions.css';

const Auctions = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);


    const [amount, setAmount] = useState('');
    const [bidder, setBidder] = useState('');
    const [contact, setContact] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchEligibleLoans();
    }, []);

    const fetchEligibleLoans = async () => {
        try {
            const { data } = await api.get('/auctions/eligible');
            setLoans(data);
        } catch (error) {
            console.error("Error fetching auctions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuction = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to auction this item? This cannot be undone.")) return;

        try {
            await api.post(`/auctions/${selectedLoan._id}/sell`, {
                auctionAmount: amount,
                bidderName: bidder,
                bidderContact: contact,
                remarks: notes
            });
            alert("Auction Recorded Successfully!");
            setSelectedLoan(null);
            fetchEligibleLoans();
        } catch (error) {
            alert(error.response?.data?.message || "Auction failed");
        }
    };

    return (
        <div className="auctions-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>
                        <Gavel className="primary-icon" /> Auction Management
                    </h1>
                    <p>Manage overdue items and record auction sales</p>
                </div>
            </div>

            <div className="auctions-grid">

                <div className="eligible-card">
                    <div className="card-header-bar">
                        <h3>Eligible for Auction (Overdue)</h3>
                        <span className="count-badge">
                            {loans.length} Items
                        </span>
                    </div>

                    <div className="eligible-list">
                        {loading ? (
                            <div className="loading-placeholder">Loading loans...</div>
                        ) : loans.length === 0 ? (
                            <div className="empty-placeholder">
                                <CheckCircle size={48} className="success-icon" />
                                <p>No overdue loans eligible for auction.</p>
                            </div>
                        ) : (
                            loans.map(loan => (
                                <div
                                    key={loan._id}
                                    className={`loan-item ${selectedLoan?._id === loan._id ? 'active' : ''}`}
                                    onClick={() => setSelectedLoan(loan)}
                                >
                                    <div className="loan-header">
                                        <span className="loan-id">{loan.loanId}</span>
                                        <span className="due-amount">₹{loan.currentBalance} Due</span>
                                    </div>
                                    <div className="customer-info">
                                        <p>{loan.customer?.name} • {loan.customer?.phone}</p>
                                    </div>
                                    <div className="loan-meta">
                                        <span>Pledged: {new Date(loan.loanDate).toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
                <div className="action-card">
                    {!selectedLoan ? (
                        <div className="selection-tip">
                            <Gavel size={64} className="tip-icon" />
                            <p>Select a loan from the list to initiate auction</p>
                        </div>
                    ) : (
                        <form onSubmit={handleAuction} className="auction-form">
                            <div className="form-header">
                                <h3>Auctioning: {selectedLoan.loanId}</h3>
                            </div>

                            <div className="form-sections">
                                <div className="form-group">
                                    <label>Sale Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="input-field"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bidder Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={bidder}
                                        onChange={e => setBidder(e.target.value)}
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bidder Contact</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Remarks</label>
                                    <textarea
                                        className="input-field text-area"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Add any additional notes here..."
                                    ></textarea>
                                </div>

                                <div className="alert-box warning">
                                    <AlertCircle size={20} className="alert-icon" />
                                    <p>This action will mark the loan as Closed (Auctioned) and record the amount as income.</p>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary-auction"
                                >
                                    <Gavel size={20} /> Confirm Auction Sale
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auctions;
