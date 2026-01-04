import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calculator, Upload, Gem, UserCheck, AlertCircle } from 'lucide-react';
import './PledgeEntry.css';

const PledgeEntry = () => {
    const [schemes, setSchemes] = useState([]);
    const [goldRate, setGoldRate] = useState(null);
    const [customers, setCustomers] = useState([]); // Simplified: Fetch all for dropdown
    const [formData, setFormData] = useState({
        customerId: '',
        schemeId: '',
        requestedLoan: '',
    });
    const [preInterestAmount, setPreInterestAmount] = useState(''); // New State

    useEffect(() => {
        if (formData.schemeId && formData.requestedLoan) {
            const scheme = schemes.find(s => s._id === formData.schemeId);
            if (scheme && scheme.preInterestMonths > 0) {
                const interest = (parseFloat(formData.requestedLoan) * scheme.interestRate) / 100;
                const preInterest = interest * scheme.preInterestMonths;
                setPreInterestAmount(preInterest.toFixed(2));
            } else {
                setPreInterestAmount('');
            }
        }
    }, [formData.schemeId, formData.requestedLoan, schemes]);
    const [items, setItems] = useState([{ name: '', netWeight: '', purity: '22k', description: '' }]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch independent data
                const [schemesRes, custRes] = await Promise.all([
                    api.get('/masters/schemes'),
                    api.get('/customers')
                ]);
                setSchemes(schemesRes.data);
                setCustomers(custRes.data);

                // Fetch Gold Rate separately (might be 404)
                try {
                    const rateRes = await api.get('/masters/gold-rate/latest');
                    setGoldRate(rateRes.data);
                } catch (err) {
                    console.log("No gold rate set yet.");
                    setGoldRate(null);
                }

            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        };
        fetchData();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', netWeight: '', purity: '22k', description: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const calculateValuation = () => {
        if (!goldRate) return 0;
        let total = 0;
        items.forEach(item => {
            const weight = parseFloat(item.netWeight) || 0;
            const rate = item.purity === '24k' ? goldRate.ratePerGram24k : goldRate.ratePerGram22k;
            total += weight * rate;
        });
        return total;
    };

    const calculateMaxLoan = () => {
        const valuation = calculateValuation();
        const scheme = schemes.find(s => s._id === formData.schemeId);
        return scheme ? valuation * (scheme.maxLoanPercentage / 100) : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('customerId', formData.customerId);
        data.append('schemeId', formData.schemeId);
        data.append('requestedLoanAmount', formData.requestedLoan);
        data.append('preInterestAmount', preInterestAmount); // Send new field
        data.append('items', JSON.stringify(items));

        for (let i = 0; i < files.length; i++) {
            data.append('photos', files[i]);
        }

        try {
            await api.post('/loans', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Pledge Created Successfully!');
            // Reset form logic here
        } catch (error) {
            console.error('Submission failed', error);
            const serverMsg = error.response?.data?.message || 'Failed to create pledge';
            alert(serverMsg);
        }
    };

    // Derived values for UI
    const totalValuation = calculateValuation();
    const maxEligibleLoan = calculateMaxLoan();

    return (
        <div className="pledge-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>New Pledge</h1>
                    <p>Create a new gold loan application</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pledge-layout">

                {/* LEFT COLUMN - FORM INPUTS */}
                <div className="form-column">

                    {/* Customer & Scheme Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="section-icon icon-blue">
                                <UserCheck size={20} />
                            </div>
                            <h2>1. Customer & Scheme</h2>
                        </div>

                        <div className="form-grid-2">
                            <div>
                                <label className="form-label-bold">Select Customer</label>
                                <select
                                    className="select-input"
                                    value={formData.customerId}
                                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.customerId})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label-bold">Select Scheme</label>
                                <select
                                    className="select-input"
                                    value={formData.schemeId}
                                    onChange={e => setFormData({ ...formData, schemeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Scheme...</option>
                                    {schemes.map(s => <option key={s._id} value={s._id}>{s.schemeName} ({s.interestRate}% Interest)</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="form-section">
                        <div className="section-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="section-icon icon-purple">
                                    <Gem size={20} />
                                </div>
                                <h2>2. Jewellery Items</h2>
                            </div>
                            <button type="button" onClick={addItem} className="btn-add-item">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="items-stack">
                            {items.map((item, index) => (
                                <div key={index} className="item-row">
                                    <div className="item-number">#{index + 1}</div>
                                    <div className="item-grid">
                                        <div>
                                            <label className="input-label-sm">Item Name</label>
                                            <input
                                                type="text" placeholder="e.g. Gold Ring"
                                                className="input-sm"
                                                value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label-sm">Weight (g)</label>
                                            <input
                                                type="number" placeholder="0.00" step="0.01"
                                                className="input-sm"
                                                value={item.netWeight} onChange={e => handleItemChange(index, 'netWeight', e.target.value)} required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label-sm">Purity</label>
                                            <select
                                                className="input-sm"
                                                value={item.purity} onChange={e => handleItemChange(index, 'purity', e.target.value)}
                                            >
                                                <option value="22k">22 Karat (Standard)</option>
                                                <option value="24k">24 Karat (Fine)</option>
                                            </select>
                                        </div>
                                        <div>
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)} className="btn-remove">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-desc">
                                        <input
                                            type="text" placeholder="Description / Remarks (Optional)"
                                            className="input-sm"
                                            value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="upload-area">
                            <label className="form-label-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={18} color="#94a3b8" /> Upload Item Photos
                            </label>
                            <div className="upload-box">
                                <input type="file" multiple onChange={handleFileChange} className="hidden" id="photo-upload" style={{ display: 'none' }} />
                                <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                                    <div className="upload-icon-circle">
                                        <Upload size={24} />
                                    </div>
                                    <p style={{ fontWeight: 500, color: '#334155' }}>Click to upload photos</p>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                        {files.length > 0 ? `${files.length} files selected` : "SVG, PNG, JPG or GIF (max. 800x400px)"}
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - CALCULATOR */}
                <div className="calc-column">
                    <div className="calculator-card">
                        <div className="section-header">
                            <div className="section-icon icon-yellow">
                                <Calculator size={20} />
                            </div>
                            <h2>Valuation Details</h2>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div className="calc-row">
                                <span className="calc-label">Gold Rate (22k)</span>
                                <span className="calc-val">{goldRate ? `₹${goldRate.ratePerGram22k}/g` : 'N/A'}</span>
                            </div>
                            <div className="calc-row">
                                <span className="calc-label">Total Weight</span>
                                <span className="calc-val">{items.reduce((acc, i) => acc + (parseFloat(i.netWeight) || 0), 0).toFixed(2)} g</span>
                            </div>

                            <div className="divider"></div>

                            <div className="total-row">
                                <span style={{ color: '#64748b' }}>Gross Valuation</span>
                                <span className="total-val">₹{totalValuation.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span style={{ color: '#64748b' }}>Max Loan Limit</span>
                                <span className="total-val green-text">₹{maxEligibleLoan.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="loan-input-box">
                            <label className="input-label-sm" style={{ color: '#a16207', marginBottom: '8px' }}>Enter Required Loan Amount</label>
                            <div className="loan-input-wrapper">
                                <span className="currency-symbol">₹</span>
                                <input
                                    type="number"
                                    className="loan-input"
                                    value={formData.requestedLoan}
                                    placeholder="0.00"
                                    onChange={e => setFormData({ ...formData, requestedLoan: e.target.value })}
                                    required
                                    max={maxEligibleLoan > 0 ? maxEligibleLoan : undefined}
                                />
                            </div>
                            {formData.requestedLoan > maxEligibleLoan && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>
                                    <AlertCircle size={12} /> Exceeds eligible limit
                                </div>
                            )}
                        </div>

                        <div className="divider"></div>

                        {formData.schemeId && (
                            <div style={{ marginBottom: '16px' }}>
                                <div className="calc-row">
                                    <span className="calc-label">Loan Tenure</span>
                                    <span className="calc-val">{schemes.find(s => s._id === formData.schemeId)?.tenureMonths || 0} Months</span>
                                </div>
                                <div className="calc-row">
                                    <span className="calc-label" style={{ color: '#ea580c' }}>Pre-Interest Deduction</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₹</span>
                                        <input
                                            type="number"
                                            className="input-sm"
                                            style={{ width: '80px', textAlign: 'right', padding: '2px 4px' }}
                                            value={preInterestAmount}
                                            onChange={e => setPreInterestAmount(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="total-row" style={{ marginTop: '12px', borderTop: '2px solid #e2e8f0', paddingTop: '12px' }}>
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>Net Cash to Customer</span>
                            <span className="total-val" style={{ color: '#0f172a' }}>
                                ₹{((parseFloat(formData.requestedLoan) || 0) - (parseFloat(preInterestAmount) || 0)).toFixed(2)}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={formData.requestedLoan > maxEligibleLoan || maxEligibleLoan === 0}
                            className="btn-submit"
                        >
                            Approve & Create Pledge
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PledgeEntry;
