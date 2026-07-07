import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfileSettings() {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        city: user?.city || '',
        budget: user?.budget || '',
        sleep_schedule: user?.sleep_schedule || '',
        cleanliness: user?.cleanliness || '',
        smoking: user?.smoking || ''
    });
    const [status, setStatus] = useState('');
    const [targetTenant, setTargetTenant] = useState('');
    const [compatibility, setCompatibility] = useState(null);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:3000/api/profile', formData);
            setStatus('Profile updated successfully!');
        } catch (err) {
            setStatus('Failed to update profile.');
        }
    };

    const checkCompatibility = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/compatibility/${targetTenant}`);
            setCompatibility(res.data.compatibilityScore);
        } catch (err) {
            setCompatibility('Error or user not found');
        }
    };

    return (
        <div className="app-container">
            <header className="navbar">
                <h1>Settings & Compatibility</h1>
                <Link to="/dashboard" className="btn">Back to Dashboard</Link>
            </header>

            <div className="split-layout">
                <div className="card">
                    <h2>Update Preferences</h2>
                    {status && <p className={status.includes('success') ? 'success-text' : 'error-text'}>{status}</p>}
                    <form onSubmit={handleUpdate} style={{ marginTop: '1rem' }}>
                        <div className="input-group">
                            <label>City</label>
                            <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Budget</label>
                            <input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Sleep Schedule</label>
                            <select value={formData.sleep_schedule} onChange={(e) => setFormData({...formData, sleep_schedule: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="early_bird">Early Bird</option>
                                <option value="night_owl">Night Owl</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Cleanliness</label>
                            <select value={formData.cleanliness} onChange={(e) => setFormData({...formData, cleanliness: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="neat">Neat</option>
                                <option value="average">Average</option>
                                <option value="messy">Messy</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Smoking</label>
                            <select value={formData.smoking} onChange={(e) => setFormData({...formData, smoking: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }}>Save Profile</button>
                    </form>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h2>Check Compatibility</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter another tenant's ID to calculate your match score.</p>
                    <div className="input-group">
                        <label>Tenant ID</label>
                        <input type="number" value={targetTenant} onChange={(e) => setTargetTenant(e.target.value)} placeholder="e.g. 5" />
                    </div>
                    <button onClick={checkCompatibility} className="btn" style={{ width: '100%' }}>Calculate Score</button>
                    
                    {compatibility !== null && (
                        <div className="compatibility-score">
                            {typeof compatibility === 'number' ? `${compatibility}% Match` : compatibility}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
