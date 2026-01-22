import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calculator, Upload, Gem, UserCheck, AlertCircle } from 'lucide-react';
import './PledgeEntry.css';

const PledgeEntry = () => {
    const [schemes, setSchemes] = useState([]);
    const [goldRate, setGoldRate] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        schemeId: '',
        requestedLoan: '',
    });
    const [preInterestAmount, setPreInterestAmount] = useState('');

    // Customization State
    const [customRequest, setCustomRequest] = useState(null); // Stores approved request if any
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestReason, setRequestReason] = useState('');
    const [proposedValues, setProposedValues] = useState({
        interestRate: '',
        tenureMonths: '',
        maxLoanPercentage: ''
    });

    useEffect(() => {
        if (formData.schemeId && formData.requestedLoan) {
            const scheme = schemes.find(s => s._id === formData.schemeId);

            // Use custom values if in custom mode
            const currentInterestRate = isCustomMode && customRequest ? customRequest.proposedValues.interestRate : (scheme?.interestRate || 0);
            const currentTenure = isCustomMode && customRequest ? customRequest.proposedValues.tenureMonths : (scheme?.tenureMonths || 12);
            const currentPreInterestMonths = scheme?.preInterestMonths || 0;

            if (currentPreInterestMonths > 0) {
                const totalInterest = (parseFloat(formData.requestedLoan) * currentInterestRate) / 100;
                const monthlyInterest = totalInterest / currentTenure;
                const preInterest = monthlyInterest * currentPreInterestMonths;
                setPreInterestAmount(preInterest.toFixed(2));
            } else {
                setPreInterestAmount('');
            }
        }
    }, [formData.schemeId, formData.requestedLoan, schemes, isCustomMode, customRequest]);

    // Check for approved requests when customer/scheme changes
    useEffect(() => {
        if (formData.customerId && formData.schemeId) {
            checkCustomStatus();
        } else {
            setCustomRequest(null);
            setIsCustomMode(false);
        }
    }, [formData.customerId, formData.schemeId]);

    const checkCustomStatus = async () => {
        try {
            const { data } = await api.get('/scheme-requests/check', {
                params: { customerId: formData.customerId, schemeId: formData.schemeId }
            });
            if (data) {
                setCustomRequest(data);
                setIsCustomMode(true); // Auto-enable if approved request exists
                alert("Custom Scheme Approved! Values updated.");
            } else {
                setCustomRequest(null);
                setIsCustomMode(false);
            }
        } catch (error) {
            console.error("Failed to check custom status", error);
        }
    };

    const handleRequestSubmit = async () => {
        try {
            await api.post('/scheme-requests', {
                customerId: formData.customerId,
                originalSchemeId: formData.schemeId,
                proposedValues: {
                    interestRate: parseFloat(proposedValues.interestRate),
                    tenureMonths: parseInt(proposedValues.tenureMonths),
                    maxLoanPercentage: parseFloat(proposedValues.maxLoanPercentage)
                },
                reason: requestReason
            });
            alert("Request sent to Admin successfully!");
            setShowRequestModal(false);
        } catch (error) {
            alert("Failed to send request");
        }
    };
    const [items, setItems] = useState([{ name: '', netWeight: '', purity: '22k', description: '' }]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {

                const [schemesRes, custRes] = await Promise.all([
                    api.get('/masters/schemes'),
                    api.get('/customers')
                ]);
                setSchemes(schemesRes.data);
                setCustomers(custRes.data);


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

        const maxPercent = (isCustomMode && customRequest?.proposedValues?.maxLoanPercentage)
            ? customRequest.proposedValues.maxLoanPercentage
            : (scheme?.maxLoanPercentage || 0);

        return scheme ? valuation * (maxPercent / 100) : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('customerId', formData.customerId);
        data.append('schemeId', formData.schemeId);
        data.append('requestedLoanAmount', formData.requestedLoan);
        data.append('preInterestAmount', preInterestAmount);

        if (isCustomMode && customRequest) {
            data.append('isCustomScheme', true);
            data.append('customSchemeValues', JSON.stringify(customRequest.proposedValues));
        }

        data.append('items', JSON.stringify(items));

        for (let i = 0; i < files.length; i++) {
            data.append('photos', files[i]);
        }

        try {
            await api.post('/loans', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Pledge Created Successfully!');

        } catch (error) {
            console.error('Submission failed', error);
            const serverMsg = error.response?.data?.message || 'Failed to create pledge';
            alert(serverMsg);
        }
    };


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

                <div className="form-column">
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

                        {/* Customization Request Button */}
                        {formData.schemeId && formData.customerId && (
                            <div className="customization-wrapper">
                                {isCustomMode ? (
                                    <div className="custom-scheme-badge">
                                        Active Custom Scheme: {customRequest.proposedValues.interestRate}% Interest, {customRequest.proposedValues.tenureMonths} Months
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const s = schemes.find(x => x._id === formData.schemeId);
                                            setProposedValues({
                                                interestRate: s.interestRate,
                                                tenureMonths: s.tenureMonths,
                                                maxLoanPercentage: s.maxLoanPercentage
                                            });
                                            setShowRequestModal(true);
                                        }}
                                        className="btn-request-link"
                                    >
                                        Request Scheme Customization (for this customer)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <div className="section-header space-between">
                            <div className="flex-align-center-gap-12">
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
                            <label className="form-label-bold flex-align-center-gap-8">
                                <Upload size={18} color="#94a3b8" /> Upload Item Photos
                            </label>
                            <div className="upload-box">
                                <input type="file" multiple onChange={handleFileChange} className="hidden file-hidden" id="photo-upload" />
                                <label htmlFor="photo-upload" className="upload-label">
                                    <div className="upload-icon-circle">
                                        <Upload size={24} />
                                    </div>
                                    <p className="upload-text">Click to upload photos</p>
                                    <p className="upload-hint">
                                        {files.length > 0 ? `${files.length} files selected` : "SVG, PNG, JPG or GIF (max. 800x400px)"}
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="calc-column">
                    <div className="calculator-card">
                        <div className="section-header">
                            <div className="section-icon icon-yellow">
                                <Calculator size={20} />
                            </div>
                            <h2>Valuation Details</h2>
                        </div>

                        <div className="calc-section-spacing">
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
                                <span className="muted-small">Gross Valuation</span>
                                <span className="total-val">₹{totalValuation.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span className="muted-small">Max Loan Limit</span>
                                <span className="total-val green-text">₹{maxEligibleLoan.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="loan-input-box">
                            <label className="input-label-sm warning-label">Enter Required Loan Amount</label>
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
                                <div className="alert-inline">
                                    <AlertCircle size={12} /> Exceeds eligible limit
                                </div>
                            )}
                        </div>

                        <div className="divider"></div>

                        {formData.schemeId && (
                            <div className="scheme-info">
                                <div className="calc-row">
                                    <span className="calc-label">Loan Tenure</span>
                                    <span className="calc-val">{(isCustomMode && customRequest ? customRequest.proposedValues.tenureMonths : schemes.find(s => s._id === formData.schemeId)?.tenureMonths) || 0} Months</span>
                                </div>
                                <div className="calc-row">
                                    <span className="calc-label calc-label-orange">Pre-Interest Deduction</span>
                                    <div className="flex-align-center-gap-4">
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₹</span>
                                        <input
                                            type="number"
                                            className="input-sm input-small-narrow"
                                            value={preInterestAmount}
                                            onChange={e => setPreInterestAmount(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="total-row net-cash-row">
                            <span className="dark-strong">Net Cash to Customer</span>
                            <span className="total-val dark-text">
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

            {/* Simple Modal for Request */}
            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Request Custom Scheme</h3>
                        <div className="modal-content-stack">
                            <div>
                                <label className="input-label-sm">Interest Rate (%)</label>
                                <input type="number" className="input-field" value={proposedValues.interestRate} onChange={e => setProposedValues({ ...proposedValues, interestRate: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label-sm">Tenure (Months)</label>
                                <input type="number" className="input-field" value={proposedValues.tenureMonths} onChange={e => setProposedValues({ ...proposedValues, tenureMonths: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label-sm">Max Loan % (LTV)</label>
                                <input type="number" className="input-field" value={proposedValues.maxLoanPercentage} onChange={e => setProposedValues({ ...proposedValues, maxLoanPercentage: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label-sm">Reason</label>
                                <textarea className="input-field" rows="2" value={requestReason} onChange={e => setRequestReason(e.target.value)} placeholder="Why is this change needed?" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="btn-cancel">Cancel</button>
                                <button type="button" onClick={handleRequestSubmit} className="btn-confirm">Send Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default PledgeEntry;
