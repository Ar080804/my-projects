const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create tables on startup
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) CHECK (role IN ('tenant', 'landlord')) NOT NULL,
        city VARCHAR(100),
        budget INTEGER,
        sleep_schedule VARCHAR(20),
        cleanliness VARCHAR(20),
        smoking BOOLEAN DEFAULT false
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        landlord_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        city VARCHAR(100),
        price INTEGER,
        available BOOLEAN DEFAULT true
      );
    `);

    console.log('✅ Tables ready');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
};

createTables();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/compatibility', require('./routes/compatibility'));
app.use('/api/profile', require('./routes/profile'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Roommate Finder API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
