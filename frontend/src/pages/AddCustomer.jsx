import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Upload, Save, X } from 'lucide-react';
import './AddCustomer.css';

const AddCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        aadharNumber: '',
        panNumber: '',
        branch: ''
    });
    const [branches, setBranches] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [idFiles, setIdFiles] = useState({ aadharCard: null, panCard: null });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get user role/branch to decide if we show dropdown
    // We don't have direct access to user context here unless we import useAuth
    // Let's assume we can fetch branches. If api returns branches, we show them. 
    // If user is staff, api/branches might return only 1 or 403? 
    // Actually, we updated getBranches to return user's branch for staff.
    // So distinct logic: If > 1 branch or Admin, show dropdown?
    // Safer: Just fetch branches. If user is staff, backend createCustomer ignores input anyway.
    // But for UX, better to show selected or separate. 
    // Let's just add the field.

    useEffect(() => {
        fetchBranches();
        if (isEditMode) {
            fetchCustomerData();
        }
    }, [id]);

    const fetchBranches = async () => {
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch (error) {
            console.error("Failed to fetch branches");
        }
    };

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/customers/${id}`);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                aadharNumber: data.aadharNumber || '',
                panNumber: data.panNumber || '',
                branch: data.branch || ''
            });
            if (data.photo) {
                setPreview(`http://localhost:5000/${data.photo}`);
            }
        } catch (error) {
            console.error("Failed to fetch customer", error);
            alert("Failed to load customer data");
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

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

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setIdFiles(prev => ({ ...prev, [name]: files[0] }));
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
        data.append('aadharNumber', formData.aadharNumber);
        data.append('aadharNumber', formData.aadharNumber);
        data.append('panNumber', formData.panNumber);
        if (formData.branch) data.append('branch', formData.branch);

        if (photo) data.append('photo', photo);
        if (idFiles.aadharCard) data.append('aadharCard', idFiles.aadharCard);
        if (idFiles.panCard) data.append('panCard', idFiles.panCard);

        try {
            if (isEditMode) {
                await api.put(`/customers/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Customer Updated Successfully!');
                navigate(`/customers/${id}`);
            } else {
                await api.post('/customers', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Customer Added Successfully!');
                navigate('/customers');
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            const serverMsg = error.response?.data?.message || 'Failed to save customer';
            alert(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container form-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
                    <p>{isEditMode ? 'Update customer details' : 'Register a new customer for KYC'}</p>
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

                        {/* Branch Selection (Visible if branches loaded, usually for Admin) */}
                        {branches.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Assign Branch</label>
                                <select
                                    name="branch"
                                    className="input-field"
                                    value={formData.branch || ''}
                                    onChange={handleChange}
                                    required={!isEditMode && branches.length > 1} // Required if multiple choices (Admin)
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                                rows="2"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Full residential address"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aadhar Number</label>
                            <input
                                type="text"
                                name="aadharNumber"
                                className="input-field"
                                value={formData.aadharNumber}
                                onChange={handleChange}
                                placeholder="xxxx-xxxx-xxxx"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PAN Number</label>
                            <input
                                type="text"
                                name="panNumber"
                                className="input-field"
                                value={formData.panNumber}
                                onChange={handleChange}
                                placeholder="ABCDE1234F"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aadhar Card Photo {isEditMode && '(Upload to replace)'}</label>
                            <input
                                type="file"
                                name="aadharCard"
                                className="input-field"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PAN Card Photo {isEditMode && '(Upload to replace)'}</label>
                            <input
                                type="file"
                                name="panCard"
                                className="input-field"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
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
                        <button type="button" className="btn-secondary" onClick={() => navigate(isEditMode ? `/customers/${id}` : '/customers')}>
                            <X size={18} /> Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} /> {loading ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomer;
