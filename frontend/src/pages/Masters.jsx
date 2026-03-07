import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, TrendingUp, Layers, Save, Trash2, Printer } from 'lucide-react';
import './Masters.css';

const Masters = () => {

    const [rate22k, setRate22k] = useState('');
    const [rate20k, setRate20k] = useState('');
    const [rate18k, setRate18k] = useState('');
    const [deduction22k, setDeduction22k] = useState('');
    const [deductionOrdinary, setDeductionOrdinary] = useState('');
    const [currentRate, setCurrentRate] = useState(null);
    const [loadingRate, setLoadingRate] = useState(false);
    const [activeTab, setActiveTab] = useState('goldrates');


    const [schemeName, setSchemeName] = useState('');
    const [interestMonths, setInterestMonths] = useState({
        m1:'', m2:'', m3:'', m4:'', m5:'', m6:'', m7:'', m8:'', m9:'', m10:'', m11:'', m12:'', afterValidity:''
    });
    const [tenure, setTenure] = useState('');
    const [preInterest, setPreInterest] = useState('');
    const [maxLoan, setMaxLoan] = useState('');
    const [schemes, setSchemes] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [rateRes, schemeRes] = await Promise.all([
                api.get('/masters/gold-rate/latest'),
                api.get('/masters/schemes')
            ]);
            setCurrentRate(rateRes.data);
            setSchemes(schemeRes.data);
        } catch (error) {
            console.error("Error fetching master data", error);
        }
    };

    const handleGoldRateSubmit = async (e) => {
        e.preventDefault();
        setLoadingRate(true);
        try {
            const { data } = await api.post('/masters/gold-rate', {
                ratePerGram22k: parseFloat(rate22k),
                ratePerGram20k: parseFloat(rate20k),
                ratePerGram18k: parseFloat(rate18k),
                deduction22k: parseFloat(deduction22k) || 0,
                deductionOrdinary: parseFloat(deductionOrdinary) || 0
            });
            setCurrentRate(data);
            alert('Gold Rate Updated!');
            setRate22k('');
            setRate20k('');
            setRate18k('');
            setDeduction22k('');
            setDeductionOrdinary('');
        } catch (error) {
            alert('Failed to update rate');
        } finally {
            setLoadingRate(false);
        }
    };

    const handleDeleteGoldRate = async () => {
        if (window.confirm('Clear today\'s gold rates? Valuation will be disabled.')) {
            try {
                await api.delete(`/masters/gold-rate/${currentRate._id}`);
                setCurrentRate(null);
                alert('Today\'s rates cleared');
            } catch (error) {
                alert('Failed to clear rates');
            }
        }
    };

    const handleSchemeSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/masters/schemes', {
                schemeName,
                interestMonths: {
                    m1: parseFloat(interestMonths.m1) || 0, m2: parseFloat(interestMonths.m2) || 0, m3: parseFloat(interestMonths.m3) || 0,
                    m4: parseFloat(interestMonths.m4) || 0, m5: parseFloat(interestMonths.m5) || 0, m6: parseFloat(interestMonths.m6) || 0,
                    m7: parseFloat(interestMonths.m7) || 0, m8: parseFloat(interestMonths.m8) || 0, m9: parseFloat(interestMonths.m9) || 0,
                    m10: parseFloat(interestMonths.m10) || 0, m11: parseFloat(interestMonths.m11) || 0, m12: parseFloat(interestMonths.m12) || 0,
                    afterValidity: parseFloat(interestMonths.afterValidity) || 0
                },
                tenureMonths: parseInt(tenure),
                maxLoanPercentage: parseFloat(maxLoan),
                preInterestMonths: parseInt(preInterest) || 0
            });
            setSchemes([...schemes, data]);
            alert('Scheme Added!');
            setSchemeName('');
            setInterestMonths({m1:'', m2:'', m3:'', m4:'', m5:'', m6:'', m7:'', m8:'', m9:'', m10:'', m11:'', m12:'', afterValidity:''});
            setTenure('');
            setPreInterest('');
            setMaxLoan('');
        } catch (error) {
            alert('Failed to add scheme');
        }
    };

    const handleDeleteScheme = async (id) => {
        if (window.confirm('Are you sure you want to delete this scheme?')) {
            try {
                await api.delete(`/masters/schemes/${id}`);
                setSchemes(schemes.filter(s => s._id !== id));
                alert('Scheme Deleted');
            } catch (error) {
                console.error("Error deleting scheme", error);
                alert('Failed to delete scheme');
            }
        }
    };

    const handlePrintScheme = (scheme) => {
        window.open(`/print/scheme-report/${scheme._id}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="masters-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>System Masters</h1>
                    <p>Configure gold rates and loan schemes</p>
                </div>
            </div>

            <div className="tabs-header">
                <button
                    className={`tab-btn ${activeTab === 'goldrates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('goldrates')}
                >
                    <TrendingUp size={18} /> Gold Rates
                </button>
                <button
                    className={`tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schemes')}
                >
                    <Layers size={18} /> Loan Schemes
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'goldrates' && (
                    <div className="master-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="card-header">
                        <div className="icon-box gold-icon">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3>Daily Gold Rates</h3>
                            <p>Set today's market rate manually</p>
                        </div>
                    </div>

                    <form onSubmit={handleGoldRateSubmit} className="form-stack">
                        <div className="form-group">
                            <label className="form-label">22k Rate (per gram) (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={rate22k}
                                onChange={e => setRate22k(e.target.value)}
                                placeholder={currentRate ? currentRate.ratePerGram22k : "0.00"}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">20k Rate (per gram) (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={rate20k}
                                onChange={e => setRate20k(e.target.value)}
                                placeholder={currentRate ? currentRate.ratePerGram20k : "0.00"}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">18k Rate (per gram) (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={rate18k}
                                onChange={e => setRate18k(e.target.value)}
                                placeholder={currentRate ? currentRate.ratePerGram18k : "0.00"}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#d97706' }}>22k (916) Deduction (%)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={deduction22k}
                                    onChange={e => setDeduction22k(e.target.value)}
                                    placeholder={currentRate?.deduction22k || "0"}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#d97706' }}>Ordinary Gold Deduction (%)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={deductionOrdinary}
                                    onChange={e => setDeductionOrdinary(e.target.value)}
                                    placeholder={currentRate?.deductionOrdinary || "0"}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loadingRate} style={{ marginTop: '12px' }}>
                            <Save size={16} /> Save Daily Rate
                        </button>

                    </form>

                    <div className="history-list">
                        <h4 className="history-title">
                            Currently Set Rates
                            {currentRate && <span className="history-meta">

                                Last Update: {new Date(currentRate.rateDate).toLocaleDateString('en-IN')}
                                <button
                                    onClick={handleDeleteGoldRate}
                                    className="btn-clear-rate"
                                    title="Delete today's rates"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </span>}
                        </h4>
                        {currentRate ? (
                            <>
                                {currentRate.ratePerGram22k > 0 && (
                                    <div className="history-item">
                                        <span>22k Standard</span>
                                        <span className="rate-val">₹{currentRate.ratePerGram22k}</span>
                                    </div>
                                )}
                                {currentRate.ratePerGram20k > 0 && (
                                    <div className="history-item">
                                        <span>20k Gold</span>
                                        <span className="rate-val">₹{currentRate.ratePerGram20k}</span>
                                    </div>
                                )}
                                {currentRate.ratePerGram18k > 0 && (
                                    <div className="history-item">
                                        <span>18k Gold</span>
                                        <span className="rate-val">₹{currentRate.ratePerGram18k}</span>
                                    </div>
                                )}
                                
                                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                    <h5 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied Deductions</h5>
                                    {currentRate.deduction22k > 0 && (
                                        <div className="history-item" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                                            <span style={{ color: '#b45309' }}>22k (916) Deduction</span>
                                            <span className="rate-val" style={{ color: '#b45309' }}>-{currentRate.deduction22k}%</span>
                                        </div>
                                    )}
                                    {currentRate.deductionOrdinary > 0 && (
                                        <div className="history-item" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                                            <span style={{ color: '#b45309' }}>Ordinary Gold Deduction</span>
                                            <span className="rate-val" style={{ color: '#b45309' }}>-{currentRate.deductionOrdinary}%</span>
                                        </div>
                                    )}
                                    {(!currentRate.deduction22k && !currentRate.deductionOrdinary) && (
                                        <p className="text-muted text-sm">No deductions applied.</p>
                                    )}
                                </div>

                                {!(currentRate.ratePerGram22k > 0 || currentRate.ratePerGram20k > 0 || currentRate.ratePerGram18k > 0) && (
                                    <p className="text-muted text-sm">No rates have been set yet.</p>
                                )}
                            </>
                        ) : <p className="text-muted text-sm">No rate records found.</p>}
                    </div>
                    </div>
                )}

                {activeTab === 'schemes' && (
                    <div className="master-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="card-header">
                        <div className="icon-box scheme-icon">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3>Loan Schemes</h3>
                            <p>Define interest & limits</p>
                        </div>
                    </div>

                    <form onSubmit={handleSchemeSubmit} className="form-stack">
                        <div className="form-group">
                            <label className="form-label">Scheme Name</label>
                            <input
                                type="text" className="input-field"
                                value={schemeName} onChange={e => setSchemeName(e.target.value)}
                                placeholder="e.g. Standard Gold Loan" required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Number of months (Validity)</label>
                            <input
                                type="number" className="input-field"
                                value={tenure} onChange={e => setTenure(e.target.value)}
                                placeholder="e.g. 12" required
                            />
                        </div>
                        {tenure && parseInt(tenure) > 0 && (
                            <div className="form-row-grid">
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Interest % Matrix</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                                        {[...Array(Math.min(parseInt(tenure), 12)).keys()].map(i => {
                                            const m = i + 1;
                                            return (
                                                <input
                                                    key={`m${m}`}
                                                    type="number" className="input-field"
                                                    value={interestMonths[`m${m}`] || ''}
                                                    onChange={e => setInterestMonths({ ...interestMonths, [`m${m}`]: e.target.value })}
                                                    placeholder={`Month ${m}`} step="0.1" required
                                                />
                                            );
                                        })}
                                        <input
                                            type="number" className="input-field"
                                            value={interestMonths.afterValidity}
                                            onChange={e => setInterestMonths({ ...interestMonths, afterValidity: e.target.value })}
                                            placeholder="After Val." step="0.1" required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Max Loan to Value (%)</label>
                            <input
                                type="number" className="input-field"
                                value={maxLoan} onChange={e => setMaxLoan(e.target.value)}
                                placeholder="75" max="100" required
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            <Save size={16} /> Add Scheme
                        </button>
                    </form>

                    <div className="history-list">
                        <h4 className="history-title">Active Schemes</h4>
                        <div className="schemes-scroll-area">
                            {schemes.map(s => (
                                <div key={s._id} className="history-item">
                                    <div style={{ flex: 1 }}>
                                        <span>{s.schemeName}</span>
                                        <div className="s-det-r">
                                            <span className="scheme-rate-text">M1: {s.interestMonths?.m1}% | After: {s.interestMonths?.afterValidity}% / {s.maxLoanPercentage}% LTV</span>
                                            {s.preInterestMonths > 0 && <span className="scheme-pre-interest">Pre: {s.preInterestMonths} Mos</span>}
                                            <span style={{ fontSize: '0.8rem', color: '#2563eb', display: 'block', marginTop: '4px', fontWeight: '500' }}>
                                                Active Loans: {s.activeLoanCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handlePrintScheme(s)}
                                            className="btn-print-scheme"
                                            title="Print Loan List"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteScheme(s._id)}
                                            className="btn-delete-scheme"
                                            title="Delete Scheme"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Masters;
