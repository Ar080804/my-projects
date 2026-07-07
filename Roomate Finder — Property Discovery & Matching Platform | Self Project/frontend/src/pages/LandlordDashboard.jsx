import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function LandlordDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', city: '', price: '' });

    const fetchProperties = async () => {
        try {
            // In a real app, you'd filter by landlord_id. 
            // Here we just fetch all to keep it simple, or assuming backend filters it.
            const res = await axios.get('http://localhost:3000/api/properties');
            // Assuming the backend returns all properties, we filter locally for simplicity in this MVP
            const myProps = res.data.filter(p => p.landlord_id === user.id);
            setProperties(myProps);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/properties', formData);
            setFormData({ title: '', description: '', city: '', price: '' });
            fetchProperties();
        } catch (err) {
            console.error("Failed to create property", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/properties/${id}`);
            fetchProperties();
        } catch (err) {
            console.error("Failed to delete property", err);
        }
    };

    return (
        <div className="app-container">
            <header className="navbar">
                <h1>Landlord Portal</h1>
                <nav>
                    <span>Welcome, {user.name}</span>
                    <button onClick={logout} className="btn btn-danger">Logout</button>
                </nav>
            </header>

            <div className="split-layout">
                <div className="card" style={{ height: 'fit-content' }}>
                    <h2>Add New Property</h2>
                    <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
                        <div className="input-group">
                            <label>Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Monthly Price (₹)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }}>Post Property</button>
                    </form>
                </div>

                <div>
                    <h2>My Properties</h2>
                    <div className="property-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                        {properties.map(prop => (
                            <div key={prop.id} className="card property-card" style={{ marginBottom: '1rem' }}>
                                <h3>{prop.title}</h3>
                                <p>📍 {prop.city}</p>
                                <div className="price" style={{ paddingTop: '0.5rem', marginBottom: '1rem' }}>₹{prop.price}/mo</div>
                                <button onClick={() => handleDelete(prop.id)} className="btn btn-danger">Delete</button>
                            </div>
                        ))}
                        {properties.length === 0 && <p>You haven't listed any properties yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
