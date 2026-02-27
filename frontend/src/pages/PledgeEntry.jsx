import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calculator, Upload, Gem, UserCheck, AlertCircle, Camera, X } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import SearchableDropdown from '../components/SearchableDropdown';
import './PledgeEntry.css';

const PledgeEntry = () => {

    const GOLD_ITEMS = [
        { label: 'Aaram', value: 'Aaram' },
        { label: 'Bangles', value: 'Bangles' },
        { label: 'Bracelet', value: 'Bracelet' },
        { label: 'Chain', value: 'Chain' },
        { label: 'Chain W Locket', value: 'Chain W Locket' },
        { label: 'Coin', value: 'Coin' },
        { label: 'Document Charges', value: 'Document Charges' },
        { label: 'Drops', value: 'Drops' },
        { label: 'Ear Ring', value: 'Ear Ring' },
        { label: 'G.Malai', value: 'G.Malai' },
        { label: 'Gold Pledged', value: 'Gold Pledged' },
        { label: 'Head Chain', value: 'Head Chain' },
        { label: 'III LINE CHAIN', value: 'III LINE CHAIN' },
        { label: 'II LINE CHAIN', value: 'II LINE CHAIN' },
        { label: 'Jimikki', value: 'Jimikki' },
        { label: 'Jimmkey', value: 'Jimmkey' },
        { label: 'Kappu', value: 'Kappu' },
        { label: 'Kasu Malai', value: 'Kasu Malai' },
        { label: 'KODI', value: 'KODI' },
        { label: 'Kolusu', value: 'Kolusu' },
        { label: 'Locket', value: 'Locket' },
        { label: 'Malai', value: 'Malai' },
        { label: 'Matti', value: 'Matti' },
        { label: 'Necklace', value: 'Necklace' },
        { label: 'NETHISUDI', value: 'NETHISUDI' },
        { label: 'Retta Vada Chain', value: 'Retta Vada Chain' },
        { label: 'Ring', value: 'Ring' },
        { label: 'Stone Malai', value: 'Stone Malai' },
        { label: 'Stone Ring', value: 'Stone Ring' },
        { label: 'Stone Stud', value: 'Stone Stud' },
        { label: 'Stud', value: 'Stud' },
        { label: 'Studd W Matti', value: 'Studd W Matti' },
        { label: 'Stud Titanic', value: 'Stud Titanic' },
        { label: 'STUD W ATTAM', value: 'STUD W ATTAM' },
        { label: 'Stud W Drops', value: 'Stud W Drops' },
        { label: 'Stud with Jimmkey', value: 'Stud with Jimmkey' },
        { label: 'Stud with Stone', value: 'Stud with Stone' },
        { label: 'STUD WT MATTI', value: 'STUD WT MATTI' },
        { label: 'Stud Wt Titanic', value: 'Stud Wt Titanic' },
        { label: 'Taitanic', value: 'Taitanic' },
        { label: 'THAAYATHU', value: 'THAAYATHU' },
        { label: 'TITANIC', value: 'TITANIC' }
    ];


    const [schemes, setSchemes] = useState([]);
    const [goldRate, setGoldRate] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        schemeId: '',
        requestedLoan: '',
    });
    const [preInterestAmount, setPreInterestAmount] = useState('');

    const [customRequest, setCustomRequest] = useState(null);
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
                setIsCustomMode(true);
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
    const [showCamera, setShowCamera] = useState(false);
    const [previews, setPreviews] = useState([]);

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
                    if (rateRes.data && (rateRes.data.ratePerGram22k > 0 || rateRes.data.ratePerGram20k > 0 || rateRes.data.ratePerGram18k > 0)) {
                        setGoldRate(rateRes.data);
                    } else {
                        setGoldRate(null);
                    }
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
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleCapture = (file, previewUrl) => {
        setFiles(prev => [...prev, file]);
        setPreviews(prev => [...prev, previewUrl]);
    };

    const calculateValuation = () => {
        if (!goldRate) return 0;
        let total = 0;
        let missingRate = false;

        items.forEach(item => {
            const weight = parseFloat(item.netWeight) || 0;
            let rate = 0;
            if (item.purity === '22k') rate = goldRate.ratePerGram22k;
            else if (item.purity === '20k') rate = goldRate.ratePerGram20k;
            else if (item.purity === '18k') rate = goldRate.ratePerGram18k;

            if (!rate || rate <= 0) {
                missingRate = true;
            }
            total += weight * (rate || 0);
        });

        return missingRate ? 0 : total;
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

    // Helper to check if any item has an unset gold rate
    const hasUnsetRates = () => {
        if (!goldRate) return true;
        return items.some(item => {
            let rate = 0;
            if (item.purity === '22k') rate = goldRate.ratePerGram22k;
            else if (item.purity === '20k') rate = goldRate.ratePerGram20k;
            else if (item.purity === '18k') rate = goldRate.ratePerGram18k;
            return !rate || rate <= 0;
        });
    };

    const missingRatePurities = [...new Set(items
        .filter(item => {
            let rate = 0;
            if (item.purity === '22k') rate = goldRate?.ratePerGram22k;
            else if (item.purity === '20k') rate = goldRate?.ratePerGram20k;
            else if (item.purity === '18k') rate = goldRate?.ratePerGram18k;
            return !rate || rate <= 0;
        })
        .map(item => item.purity)
    )];

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
                                <SearchableDropdown
                                    options={customers.map(c => ({
                                        label: `${c.name} (${c.customerId})`,
                                        value: c._id
                                    }))}
                                    value={formData.customerId}
                                    onChange={value => setFormData({ ...formData, customerId: value })}
                                    placeholder="Search by name or ID..."
                                />
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
                            <div className="c-wrp">
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
                            <div className="f-c-12">
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
                                            <SearchableDropdown
                                                options={GOLD_ITEMS}
                                                value={item.name}
                                                onChange={value => handleItemChange(index, 'name', value)}
                                                placeholder="e.g. Gold Ring"
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
                                                <option value="20k">20 Karat</option>
                                                <option value="18k">18 Karat</option>
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
                            <label className="form-label-bold f-c-8">
                                <Upload size={18} color="#94a3b8" /> Upload Item Photos
                            </label>
                            <div className="upload-box">
                                <input type="file" multiple onChange={handleFileChange} className="hidden file-hidden" id="photo-upload" />
                                <div className="upload-options-row" style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                    <label htmlFor="photo-upload" className="upload-label" style={{ flex: 1, margin: 0 }}>
                                        <div className="upload-icon-circle">
                                            <Upload size={24} />
                                        </div>
                                        <p className="upload-text">Upload Photos</p>
                                    </label>
                                    <div
                                        className="upload-label"
                                        style={{ flex: 1, margin: 0, cursor: 'pointer' }}
                                        onClick={() => setShowCamera(true)}
                                    >
                                        <div className="upload-icon-circle" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                            <Camera size={24} />
                                        </div>
                                        <p className="upload-text">Take Photo</p>
                                    </div>
                                </div>
                            </div>

                            {previews.length > 0 && (
                                <div className="previews-grid">
                                    {previews.map((src, idx) => (
                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img src={src} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {showCamera && (
                        <CameraModal
                            onCapture={handleCapture}
                            onClose={() => setShowCamera(false)}
                        />
                    )}
                </div>
                <div className="calc-column">
                    <div className="calculator-card">
                        <div className="section-header">
                            <div className="section-icon icon-yellow">
                                <Calculator size={20} />
                            </div>
                            <h2>Valuation Details</h2>
                        </div>

                        <div className="c-spc">
                            {missingRatePurities.length > 0 ? (
                                <div className="alert-inline" style={{ color: '#ef4444', marginBottom: '1rem', padding: '8px', background: '#fef2f2', borderRadius: '4px' }}>
                                    <AlertCircle size={14} />
                                    <span>
                                        {missingRatePurities.includes('22k')
                                            ? `Today's 22k gold rate not set by admin${missingRatePurities.length > 1 ? ` (also ${missingRatePurities.filter(p => p !== '22k').join(' & ')})` : ''}`
                                            : `Gold rate for ${missingRatePurities.join(' & ')} not set by admin`
                                        }
                                    </span>
                                </div>
                            ) : null}

                            <div className="calc-row">
                                <span className="calc-label">Total Weight</span>
                                <span className="calc-val">{items.reduce((acc, i) => acc + (parseFloat(i.netWeight) || 0), 0).toFixed(2)} g</span>
                            </div>

                            {goldRate?.ratePerGram22k > 0 && items.some(i => i.purity === '22k') && (
                                <div className="calc-row">
                                    <span className="calc-label">Rate (22k)</span>
                                    <span className="calc-val">₹{goldRate.ratePerGram22k}/g</span>
                                </div>
                            )}
                            {goldRate?.ratePerGram20k > 0 && items.some(i => i.purity === '20k') && (
                                <div className="calc-row">
                                    <span className="calc-label">Rate (20k)</span>
                                    <span className="calc-val">₹{goldRate.ratePerGram20k}/g</span>
                                </div>
                            )}
                            {goldRate?.ratePerGram18k > 0 && items.some(i => i.purity === '18k') && (
                                <div className="calc-row">
                                    <span className="calc-label">Rate (18k)</span>
                                    <span className="calc-val">₹{goldRate.ratePerGram18k}/g</span>
                                </div>
                            )}

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
                                    <div className="f-c-4">
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
                            disabled={formData.requestedLoan > maxEligibleLoan || maxEligibleLoan === 0 || hasUnsetRates()}
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
