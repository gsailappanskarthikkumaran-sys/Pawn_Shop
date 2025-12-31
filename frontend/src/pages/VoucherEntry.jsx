import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Receipt, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import './VoucherEntry.css';

const VoucherEntry = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = {
        expense: ['Tea/Coffee', 'Stationery', 'Salary', 'Rent', 'Electricity', 'Maintenance', 'Other'],
        income: ['Commission', 'Scrap Sale', 'Other Income']
    };

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
            const { data } = await api.post('/vouchers', formData);
            setVouchers([data, ...vouchers]);
            setFormData({ ...formData, amount: '', description: '', category: '' }); // Reset partial form
            alert('Voucher Added Successfully');
        } catch (error) {
            console.error("Failed to add voucher", error);
            alert('Failed to add voucher');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this voucher?')) return;
        try {
            await api.delete(`/vouchers/${id}`);
            setVouchers(vouchers.filter(v => v._id !== id));
        } catch (error) {
            alert('Failed to delete voucher');
        }
    };

    return (
        <div className="voucher-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Voucher Entry</h1>
                    <p>Record daily office expenses and income</p>
                </div>
            </div>

            <div className="voucher-layout">
                {/* Entry Form */}
                <div className="voucher-form-card">
                    <div className="card-header">
                        <h2>New Entry</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="voucher-form">

                        {/* Type Toggle */}
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                            >
                                <TrendingDown size={18} /> Expense
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'income' ? 'active-income' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                            >
                                <TrendingUp size={18} /> Income
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category...</option>
                                {categories[formData.type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount</label>
                            <div className="input-with-icon">
                                <span>$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                rows="3"
                                placeholder="Details about the transaction..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-save-voucher">
                            <Plus size={18} /> Save Entry
                        </button>
                    </form>
                </div>

                {/* Recent List */}
                <div className="voucher-list-section">
                    <h2 className="section-title"><Receipt size={20} /> Recent Entries</h2>

                    <div className="voucher-list">
                        {loading ? <p>Loading...</p> : vouchers.length === 0 ? (
                            <div className="empty-list">No vouchers recorded.</div>
                        ) : (
                            vouchers.map(v => (
                                <div key={v._id} className="voucher-item">
                                    <div className="voucher-icon-box">
                                        {v.type === 'income' ?
                                            <TrendingUp size={20} className="text-green-500" /> :
                                            <TrendingDown size={20} className="text-red-500" />
                                        }
                                    </div>
                                    <div className="voucher-details">
                                        <h4>{v.category}</h4>
                                        <p className="voucher-desc">{v.description || 'No description'}</p>
                                        <div className="voucher-meta">
                                            <span className="voucher-date"><Calendar size={12} /> {new Date(v.date).toLocaleDateString()}</span>
                                            <span className="voucher-user">By: {v.createdBy?.fullName || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="voucher-right">
                                        <span className={`voucher-amount ${v.type}`}>
                                            {v.type === 'income' ? '+' : '-'}${v.amount.toLocaleString()}
                                        </span>
                                        <button className="btn-del-mini" onClick={() => handleDelete(v._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherEntry;
