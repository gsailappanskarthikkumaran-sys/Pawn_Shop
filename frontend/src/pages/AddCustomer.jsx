import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, Save, X } from 'lucide-react';
import './AddCustomer.css';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        if (photo) {
            data.append('photo', photo);
        }

        try {
            await api.post('/customers', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/customers');
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container form-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Add New Customer</h1>
                    <p>Register a new customer for KYC</p>
                </div>
            </div>

            <div className="add-customer-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="input-field"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="e.g. +1 234 567 890"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address (Optional)</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. john@example.com"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Address</label>
                            <textarea
                                name="address"
                                className="input-field"
                                rows="3"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Full residential address"
                            ></textarea>
                        </div>
                    </div>

                    <div className="upload-area" style={{ marginBottom: '0', padding: '24px' }}>
                        <div style={{ textAlign: 'center' }}>
                            {preview ? (
                                <div style={{ width: '120px', height: '120px', margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0' }}>
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div className="upload-icon-circle" style={{ width: '64px', height: '64px' }}>
                                    <Upload size={32} />
                                </div>
                            )}

                            <label className="btn-secondary" style={{ display: 'inline-block', marginTop: '16px' }}>
                                Choose Photo
                                <input type="file" onChange={handlePhotoChange} hidden accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/customers')}>
                            <X size={18} /> Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomer;
