import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'tenant', city: '', budget: ''
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean up empty strings for integer fields to prevent PostgreSQL type errors
            const payload = { ...formData };
            if (payload.budget === '') payload.budget = null;
            if (payload.city === '') payload.city = null;

            const res = await axios.post('http://localhost:3000/api/auth/register', payload);
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '4rem auto' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create an Account</h2>
            {error && <p className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="split-layout">
                    <div className="input-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="tenant">Tenant</option>
                            <option value="landlord">Landlord</option>
                        </select>
                    </div>
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                
                {formData.role === 'tenant' && (
                    <div className="split-layout">
                        <div className="input-group">
                            <label>City Preference</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Budget</label>
                            <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
                        </div>
                    </div>
                )}
                
                <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login here</Link>
            </p>
        </div>
    );
}
