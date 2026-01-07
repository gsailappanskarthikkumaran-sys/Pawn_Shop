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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Gavel className="text-orange-600" /> Auction Management
                    </h1>
                    <p className="text-slate-500">Manage overdue items and record auction sales</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Eligible for Auction (Overdue)</h3>
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                            {loans.length} Items
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400">Loading loans...</div>
                        ) : loans.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <CheckCircle className="mx-auto mb-2 text-green-500" />
                                No overdue loans eligible for auction.
                            </div>
                        ) : (
                            loans.map(loan => (
                                <div
                                    key={loan._id}
                                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedLoan?._id === loan._id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                                    onClick={() => setSelectedLoan(loan)}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-mono font-bold text-slate-700">{loan.loanId}</span>
                                        <span className="text-red-600 font-bold">₹{loan.currentBalance} Due</span>
                                    </div>
                                    <div className="text-sm text-slate-600 mb-1">
                                        {loan.customer?.name} • {loan.customer?.phone}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Pledged: {new Date(loan.loanDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                    {!selectedLoan ? (
                        <div className="text-center py-10 text-slate-400">
                            <Gavel size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Select a loan from the list to initiate auction</p>
                        </div>
                    ) : (
                        <form onSubmit={handleAuction}>
                            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                                Auctioning: {selectedLoan.loanId}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Sale Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Bidder Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={bidder}
                                        onChange={e => setBidder(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Bidder Contact</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Remarks</label>
                                    <textarea
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none h-20"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="bg-orange-50 text-orange-800 text-xs p-3 rounded flex gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <p>This action will mark the loan as Closed (Auctioned) and record the amount as income.</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Gavel size={18} /> Confirm Auction Sale
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
