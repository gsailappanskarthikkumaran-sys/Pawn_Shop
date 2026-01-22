import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, TrendingUp, Layers, Save, Trash2 } from 'lucide-react';
import './Masters.css';

const Masters = () => {

    const [rate22k, setRate22k] = useState('');
    const [rate20k, setRate20k] = useState('');
    const [rate18k, setRate18k] = useState('');
    const [currentRate, setCurrentRate] = useState(null);
    const [loadingRate, setLoadingRate] = useState(false);


    const [schemeName, setSchemeName] = useState('');
    const [interestRate, setInterestRate] = useState('');
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
                ratePerGram18k: parseFloat(rate18k)
            });
            setCurrentRate(data);
            alert('Gold Rate Updated!');
            setRate22k('');
            setRate20k('');
            setRate18k('');
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
                interestRate: parseFloat(interestRate),
                tenureMonths: parseInt(tenure),
                maxLoanPercentage: parseFloat(maxLoan),
                preInterestMonths: parseInt(preInterest) || 0
            });
            setSchemes([...schemes, data]);
            alert('Scheme Added!');
            setSchemeName('');
            setInterestRate('');
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

    return (
        <div className="masters-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>System Masters</h1>
                    <p>Configure gold rates and loan schemes</p>
                </div>
            </div>

            <div className="masters-grid">


                <div className="master-card">
                    <div className="card-header">
                        <div className="icon-box gold-icon">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Daily Gold Rates</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Set today's market rate manually</p>
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
                        <button type="submit" className="btn-primary" disabled={loadingRate}>
                            <Save size={16} /> Save Daily Rate
                        </button>

                    </form>

                    <div className="history-list">
                        <h4 className="history-title">
                            Currently Set Rates
                            {currentRate && <span style={{ fontSize: '0.75rem', fontWeight: 400, float: 'right', color: '#64748b' }}>
<<<<<<< HEAD
                                Last Update: {new Date(currentRate.rateDate).toLocaleDateString()}
                                <button
                                    onClick={handleDeleteGoldRate}
                                    style={{ marginLeft: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    title="Delete today's rates"
                                >
                                    <Trash2 size={12} />
                                </button>
=======
                                Updated: {new Date(currentRate.rateDate).toLocaleString('en-IN')}
>>>>>>> 493994d406e779da211316552a720ddc74cd869e
                            </span>}
                        </h4>
                        {currentRate ? (
                            <>
<<<<<<< HEAD
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
                                {!(currentRate.ratePerGram22k > 0 || currentRate.ratePerGram20k > 0 || currentRate.ratePerGram18k > 0) && (
                                    <p className="text-muted text-sm">No rates have been set yet.</p>
                                )}
=======
                                <div className="history-item">
                                    <span>Rate Date</span>
                                    <span>{new Date(currentRate.rateDate).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="history-item">
                                    <span>22k Standard</span>
                                    <span className="rate-val">₹{currentRate.ratePerGram22k}</span>
                                </div>
                                <div className="history-item">
                                    <span>24k Fine</span>
                                    <span className="rate-val">₹{currentRate.ratePerGram24k}</span>
                                </div>
>>>>>>> 493994d406e779da211316552a720ddc74cd869e
                            </>
                        ) : <p className="text-muted text-sm">No rate records found.</p>}
                    </div>
                </div>


                <div className="master-card">
                    <div className="card-header">
                        <div className="icon-box scheme-icon">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Loan Schemes</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Define interest & limits</p>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Interest (%)</label>
                                <input
                                    type="number" className="input-field"
                                    value={interestRate} onChange={e => setInterestRate(e.target.value)}
                                    placeholder="12" step="0.1" required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Number of months</label>
                                <input
                                    type="number" className="input-field"
                                    value={tenure} onChange={e => setTenure(e.target.value)}
                                    placeholder="12" required
                                />
                            </div>
                        </div>

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
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {schemes.map(s => (
                                <div key={s._id} className="history-item">
                                    <span>{s.schemeName}</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 600, display: 'block' }}>{s.interestRate}% / {s.maxLoanPercentage}% LTV</span>
                                        {s.preInterestMonths > 0 && <span style={{ fontSize: '0.7rem', color: '#ea580c' }}>Pre: {s.preInterestMonths} Mos</span>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteScheme(s._id)}
                                        className="btn-icon-danger"
                                        style={{ marginLeft: '12px', padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        title="Delete Scheme"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Masters;
