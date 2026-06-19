const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ─── LANDLORD ROUTES ────────────────────────────────────────────────────────

// POST /api/properties - Landlord adds a new property
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'landlord') return res.status(403).json({ message: 'Only landlords can add properties' });

  const { title, description, city, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO properties (landlord_id, title, description, city, price) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, description, city, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/properties/:id - Landlord edits a property
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'landlord') return res.status(403).json({ message: 'Only landlords can edit properties' });

  const { title, description, city, price, available } = req.body;
  try {
    const result = await pool.query(
      'UPDATE properties SET title=$1, description=$2, city=$3, price=$4, available=$5 WHERE id=$6 AND landlord_id=$7 RETURNING *',
      [title, description, city, price, available, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/properties/:id - Landlord deletes a property
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'landlord') return res.status(403).json({ message: 'Only landlords can delete properties' });

  try {
    const result = await pool.query(
      'DELETE FROM properties WHERE id=$1 AND landlord_id=$2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found or unauthorized' });
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TENANT ROUTES ───────────────────────────────────────────────────────────

// GET /api/properties - Fetch all available properties with optional filters
router.get('/', async (req, res) => {
  try {
    const { city, minBudget, maxBudget } = req.query;
    let query = 'SELECT * FROM properties WHERE available = true';
    const queryParams = [];
    let paramIndex = 1;

    if (city) {
      query += ` AND city = $${paramIndex}`;
      queryParams.push(city);
      paramIndex++;
    }
    if (minBudget) {
      query += ` AND price >= $${paramIndex}`;
      queryParams.push(minBudget);
      paramIndex++;
    }
    if (maxBudget) {
      query += ` AND price <= $${paramIndex}`;
      queryParams.push(maxBudget);
      paramIndex++;
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching properties' });
  }
});

// GET /api/properties/:id - Fetch a single property by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching property' });
  }
});

module.exports = router;
