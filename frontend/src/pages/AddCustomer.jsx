import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Upload, Save, X, Camera } from 'lucide-react';
import CameraModal from '../components/CameraModal';
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
        branch: '',
        fatherName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        nominee: '',
        city: '',
        pincode: '',
        state: 'Tamil Nadu'
    });
    const [branches, setBranches] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [idFiles, setIdFiles] = useState({ aadharCard: null, panCard: null });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraTarget, setCameraTarget] = useState('photo'); // 'photo', 'aadharCard', 'panCard'
    const [idPreviews, setIdPreviews] = useState({ aadharCard: null, panCard: null });

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
                branch: data.branch || '',
                fatherName: data.fatherName || '',
                dob: data.dob ? data.dob.split('T')[0] : '',
                gender: data.gender || '',
                maritalStatus: data.maritalStatus || '',
                nominee: data.nominee || '',
                city: data.city || '',
                pincode: data.pincode || '',
                state: data.state || 'Tamil Nadu'
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
            setIdPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
        }
    };

    const handleCameraCapture = (file, previewUrl) => {
        if (cameraTarget === 'photo') {
            setPhoto(file);
            setPreview(previewUrl);
        } else {
            setIdFiles(prev => ({ ...prev, [cameraTarget]: file }));
            setIdPreviews(prev => ({ ...prev, [cameraTarget]: previewUrl }));
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
        data.append('panNumber', formData.panNumber);
        if (formData.branch) data.append('branch', formData.branch);
        data.append('fatherName', formData.fatherName);
        data.append('dob', formData.dob);
        data.append('gender', formData.gender);
        data.append('maritalStatus', formData.maritalStatus);
        data.append('nominee', formData.nominee);
        data.append('city', formData.city);
        data.append('pincode', formData.pincode);
        data.append('state', formData.state);

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

                        <div className="form-group">
                            <label className="form-label">Father / Spouse Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                className="input-field"
                                value={formData.fatherName}
                                onChange={handleChange}
                                required
                                placeholder="Father or Spouse Name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                className="input-field"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="trans">Transgender</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Marital Status</label>
                            <select name="maritalStatus" className="input-field" value={formData.maritalStatus} onChange={handleChange}>
                                <option value="">Select Status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nominee Name</label>
                            <input
                                type="text"
                                name="nominee"
                                className="input-field"
                                value={formData.nominee}
                                onChange={handleChange}
                                placeholder="Nominee Name"
                                required
                            />
                        </div>


                        {branches.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Assign Branch</label>
                                <select
                                    name="branch"
                                    className="input-field"
                                    value={formData.branch || ''}
                                    onChange={handleChange}
                                    required={!isEditMode && branches.length > 1}
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
                            <label className="form-label">City / Town / Village</label>
                            <input
                                type="text"
                                name="city"
                                className="input-field"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Postal Code</label>
                            <input
                                type="text"
                                name="pincode"
                                className="input-field"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="626123"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                                type="text"
                                name="state"
                                className="input-field"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aadhar Number</label>
                            <input
                                type="number"
                                name="aadharNumber"
                                className="input-field"
                                value={formData.aadharNumber}
                                onChange={handleChange}
                                placeholder="xxxx-xxxx-xxxx"
                                required
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
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aadhar Card Photo {isEditMode && '(Upload to replace)'}</label>
                            <div className="id-upload-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    name="aadharCard"
                                    id="aadhar-upload"
                                    className="input-field"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required={!isEditMode && !idFiles.aadharCard}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn-camera-small"
                                    onClick={() => { setCameraTarget('aadharCard'); setShowCamera(true); }}
                                    style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                    title="Take Photo"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>
                            {idPreviews.aadharCard && (
                                <div className="id-preview-small" style={{ marginTop: '8px' }}>
                                    <img src={idPreviews.aadharCard} alt="Aadhar Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">PAN Card Photo {isEditMode && '(Upload to replace)'}</label>
                            <div className="id-upload-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    name="panCard"
                                    id="pan-upload"
                                    className="input-field"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required={!isEditMode && !idFiles.panCard}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn-camera-small"
                                    onClick={() => { setCameraTarget('panCard'); setShowCamera(true); }}
                                    style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                    title="Take Photo"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>
                            {idPreviews.panCard && (
                                <div className="id-preview-small" style={{ marginTop: '8px' }}>
                                    <img src={idPreviews.panCard} alt="PAN Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}
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

                            <div className="upload-options" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                                <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                                    <Upload size={18} style={{ marginRight: '8px' }} />
                                    Choose Photo
                                    <input type="file" required={!isEditMode && !photo} onChange={handlePhotoChange} hidden accept="image/*" />
                                </label>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => { setCameraTarget('photo'); setShowCamera(true); }}
                                >
                                    <Camera size={18} style={{ marginRight: '8px' }} />
                                    Take Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    {showCamera && (
                        <CameraModal
                            onCapture={handleCameraCapture}
                            onClose={() => setShowCamera(false)}
                        />
                    )}

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
