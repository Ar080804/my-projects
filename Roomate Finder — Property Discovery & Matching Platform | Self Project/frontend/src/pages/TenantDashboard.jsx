import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function TenantDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [filters, setFilters] = useState({ city: '', minBudget: '', maxBudget: '' });

    const fetchProperties = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.city) queryParams.append('city', filters.city);
            if (filters.minBudget) queryParams.append('minBudget', filters.minBudget);
            if (filters.maxBudget) queryParams.append('maxBudget', filters.maxBudget);
            
            const res = await axios.get(`http://localhost:3000/api/properties?${queryParams.toString()}`);
            setProperties(res.data);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="app-container">
            <header className="navbar">
                <h1>Roommate Finder</h1>
                <nav>
                    <span>Welcome, {user.name}</span>
                    <Link to="/profile" className="btn" style={{ background: 'var(--text-muted)' }}>Profile</Link>
                    <button onClick={logout} className="btn btn-danger">Logout</button>
                </nav>
            </header>

            <div className="filters">
                <div className="input-group">
                    <label>City Filter</label>
                    <input type="text" name="city" placeholder="e.g. Delhi" value={filters.city} onChange={handleFilterChange} />
                </div>
                <div className="input-group">
                    <label>Min Budget</label>
                    <input type="number" name="minBudget" placeholder="0" value={filters.minBudget} onChange={handleFilterChange} />
                </div>
                <div className="input-group">
                    <label>Max Budget</label>
                    <input type="number" name="maxBudget" placeholder="Any" value={filters.maxBudget} onChange={handleFilterChange} />
                </div>
            </div>

            <div className="property-grid">
                {properties.map(prop => (
                    <div key={prop.id} className="card property-card">
                        <h3>{prop.title}</h3>
                        <p>📍 {prop.city}</p>
                        <p style={{ flex: 1 }}>{prop.description}</p>
                        <div className="price">₹{prop.price}/mo</div>
                    </div>
                ))}
                {properties.length === 0 && <p>No properties match your filters.</p>}
            </div>
        </div>
    );
}
