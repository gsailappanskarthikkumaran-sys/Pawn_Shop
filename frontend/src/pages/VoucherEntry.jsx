import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Receipt, Trash2, TrendingUp, TrendingDown, Calendar, Settings, Layers } from 'lucide-react';
import './VoucherEntry.css';

const VoucherEntry = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Payment', // Default
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Simulated Vch No (Length + 1)
    const vchNo = editingId ? 'Update' : vouchers.length + 1;

    const categories = {
        Payment: ['Tea/Coffee', 'Stationery', 'Salary', 'Rent', 'Electricity', 'Maintenance', 'Other'],
        Receipt: ['Commission', 'Scrap Sale', 'Other Income'],
        Contra: ['Cash to Bank', 'Bank to Cash'],
        Sales: ['Gold Sales', 'Silver Sales', 'Old Gold Sale'],
        Purchase: ['Stationery Purchase', 'Asset Purchase'],
        Journal: ['General Adjustment', 'Correction'],
        Memo: ['Reminder', 'Suspense', 'Provisional', 'Note']
    };

    // Color Theme Map
    const typeColors = {
        Payment: '#0ea5e9',   // Sky Blue
        Receipt: '#ef4444',   // Red
        Contra: '#10b981',    // Emerald Green
        Journal: '#3b82f6',   // Royal Blue
        Sales: '#475569',     // Slate
        Purchase: '#f59e0b',  // Amber
        Memo: '#8b5cf6'       // Violet
    };

    const currentColor = typeColors[formData.type] || '#0ea5e9';

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const { data } = await api.get('/vouchers');
            setVouchers(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch vouchers", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // UPDATE
                const { data } = await api.put(`/vouchers/${editingId}`, formData);
                setVouchers(vouchers.map(v => v._id === editingId ? data : v));
                alert('Voucher Updated!');
                setEditingId(null);
            } else {
                // CREATE
                const { data } = await api.post('/vouchers', formData);
                setVouchers([data, ...vouchers]);
                alert('Voucher Registered!');
            }
            // Reset Form (Keep Type/Date, reset content)
            setFormData({ ...formData, amount: '', description: '', category: '' });
        } catch (error) {
            console.error("Failed to save voucher", error);
            alert('Failed to save voucher');
        }
    };

    const handleEdit = (voucher) => {
        setEditingId(voucher._id);
        setFormData({
            type: voucher.type,
            category: voucher.category,
            amount: voucher.amount,
            description: voucher.description || '',
            date: new Date(voucher.date).toISOString().split('T')[0]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this voucher?')) return;
        try {
            await api.delete(`/vouchers/${id}`);
            setVouchers(vouchers.filter(v => v._id !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormData({ ...formData, amount: '', description: '', category: '' });
            }
        } catch (error) {
            alert('Failed to delete voucher');
        }
    };

    // Helper to determine row labels based on type
    const isPayment = formData.type === 'Payment' || formData.type === 'Purchase'; // Purchase acts like Payment (Money Out/Expense)
    const isReceipt = formData.type === 'Receipt' || formData.type === 'Sales';    // Sales acts like Receipt (Money In/Income)
    const isContra = formData.type === 'Contra';
    const isJournal = formData.type === 'Journal';

    // Logic:
    // Payment/Purchase: Dr Category, Cr Cash
    // Receipt/Sales: Cr Category, Dr Cash

    // Row 1 (The Variable Side)
    // If Payment/Purchase -> We are Debiting the Category (Expense). Label = Dr.
    // If Receipt/Sales   -> We are Crediting the Category (Income).  Label = Cr.
    const row1Label = isPayment ? 'Dr' : 'Cr';

    // Row 2 (The Cash Side)
    const row2Label = isPayment ? 'Cr' : 'Dr';

    return (
        <div className="voucher-container">
            <h2 style={{ marginBottom: '16px', fontWeight: 'bold' }}>Voucher Entry</h2>

            <div className="tally-wrapper">
                {/* --- Top Bar --- */}
                <div className="tally-top-bar">
                    <div className="tally-field-group">
                        <span className="tally-label">Vch Type</span>
                        <input className="tally-input-s" value={formData.type} readOnly />
                    </div>
                    <div className="tally-field-group">
                        <span className="tally-label">Vch NO</span>
                        <input className="tally-input-s" value={vchNo} readOnly style={{ background: '#fff' }} />
                    </div>
                    <div className="tally-field-group">
                        <span className="tally-label">Date</span>
                        <input
                            type="date"
                            className="tally-input-m"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                {/* --- Main Colored Box --- */}
                <form onSubmit={handleSubmit}>
                    <div className="tally-form-box" style={{ borderColor: currentColor, background: `${currentColor}15` }}>
                        <div className="form-header-row" style={{ background: currentColor }}>
                            <span>Type</span>
                            <span>Particulars</span>
                            <span>Credit</span>
                            <span>Debit</span>
                        </div>

                        <div className="form-body">
                            {/* ROW 1: The Account Selection (Expense/Income) */}
                            <div className="ledger-row">
                                <span className="dr-cr-tag">{row1Label}</span>
                                <select
                                    className="tally-select"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Account...</option>
                                    {(categories[formData.type] || []).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {/* Credit Col */}
                                <input
                                    className={`tally-input-l amount-field`}
                                    disabled={isPayment} // Disabled for payment (Amount goes to Debit)
                                    value={!isPayment ? formData.amount : ''}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder={!isPayment ? "0.00" : ""}
                                    type="number"
                                />
                                {/* Debit Col */}
                                <input
                                    className={`tally-input-l amount-field`}
                                    disabled={!isPayment} // Disabled for receipt (Amount goes to Credit)
                                    value={isPayment ? formData.amount : ''}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder={isPayment ? "0.00" : ""}
                                    type="number"
                                />
                            </div>

                            {/* ROW 2: The Cash Side (Auto-filled) */}
                            <div className="ledger-row">
                                <span className="dr-cr-tag">{row2Label}</span>
                                <input className="tally-select" value="Cash Account" readOnly style={{ background: '#f8fafc' }} />
                                {/* Credit Col */}
                                <input
                                    className="tally-input-l amount-field"
                                    value={isPayment ? formData.amount : ''} // Payment credits Cash
                                    readOnly
                                    style={{ background: '#e2e8f0' }}
                                />
                                {/* Debit Col */}
                                <input
                                    className="tally-input-l amount-field"
                                    value={!isPayment ? formData.amount : ''} // Receipt debits Cash
                                    readOnly
                                    style={{ background: '#e2e8f0' }}
                                />
                            </div>
                        </div>

                        {/* Narration */}
                        <div className="narration-box" style={{ background: currentColor }}>
                            <label className="narration-label">Narration:</label>
                            <textarea
                                className="narration-input"
                                rows="2"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter details..."
                            ></textarea>
                        </div>

                        <div style={{ padding: '0 16px 16px' }}>
                            <button type="submit" className="register-btn" style={{ background: currentColor === '#f59e0b' ? '#d97706' : '#f59e0b' }}>
                                {editingId ? 'Update Voucher' : 'Register Voucher'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingId(null); setFormData({ ...formData, amount: '', description: '', category: '' }); }}
                                    style={{ marginLeft: '12px', padding: '12px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* --- Bottom Toolbar --- */}
                <div className="bottom-toolbar">
                    <button
                        type="button"
                        className={`toolbar-btn btn-memo ${formData.type === 'Memo' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Memo', category: '' })}
                    >
                        Memo
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-payment ${formData.type === 'Payment' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Payment', category: '' })}
                    >
                        Payment
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-receipt ${formData.type === 'Receipt' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Receipt', category: '' })}
                    >
                        Receipt
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-contra ${formData.type === 'Contra' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Contra', category: '' })}
                    >
                        Contra
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-journal ${formData.type === 'Journal' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Journal', category: '' })}
                    >
                        Journal
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-sales ${formData.type === 'Sales' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Sales', category: '' })}
                    >
                        Sales
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn btn-purchase ${formData.type === 'Purchase' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'Purchase', category: '' })}
                    >
                        Purchase
                    </button>
                </div>
            </div>

            {/* Existing List Implementation below for reference - styled simpler */}
            <div className="voucher-list-section">
                <h3 style={{ margin: '24px 0 16px', fontWeight: 'bold', color: '#334155' }}>Recent Vouchers</h3>
                <div className="voucher-list">
                    {loading ? <p>Loading...</p> : vouchers.length === 0 ? (
                        <div className="empty-list">No vouchers recorded.</div>
                    ) : (
                        vouchers.map(v => (
                            <div key={v._id} className="voucher-item" style={{ borderLeft: `4px solid ${typeColors[v.type] || '#cbd5e1'}` }}>
                                <div className="voucher-icon-box">
                                    {['income', 'Receipt', 'Sales'].includes(v.type) ?
                                        <TrendingUp size={20} className="text-green-500" /> :
                                        <TrendingDown size={20} className="text-red-500" />
                                    }
                                </div>
                                <div className="voucher-details">
                                    <h4>{v.category} <span className="text-xs text-gray-400">({v.type})</span></h4>
                                    <p className="voucher-desc">{v.description || 'No description'}</p>
                                    <div className="voucher-meta">
                                        <span className="voucher-date"><Calendar size={12} /> {new Date(v.date).toLocaleDateString()}</span>
                                        <span className="voucher-user">By: {v.createdBy?.fullName || 'Unknown'}</span>
                                    </div>
                                </div>
                                <div className="voucher-right">
                                    <span className={`voucher-amount ${['income', 'Receipt', 'Sales'].includes(v.type) ? 'income' : 'expense'}`}>
                                        {['income', 'Receipt', 'Sales'].includes(v.type) ? '+' : '-'}₹{v.amount.toLocaleString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-del-mini"
                                            onClick={() => handleEdit(v)}
                                            title="Edit"
                                            style={{ color: '#3b82f6' }}
                                        >
                                            <Settings size={14} />
                                        </button>
                                        <button
                                            className="btn-del-mini"
                                            onClick={() => handleDelete(v._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherEntry;
