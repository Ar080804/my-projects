const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// PUT /api/profile - Logged-in tenant updates their profile
router.put('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { city, budget, sleep_schedule, cleanliness, smoking } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET city = COALESCE($1, city), 
           budget = COALESCE($2, budget), 
           sleep_schedule = COALESCE($3, sleep_schedule), 
           cleanliness = COALESCE($4, cleanliness), 
           smoking = COALESCE($5, smoking) 
       WHERE id = $6 
       RETURNING id, name, email, role, city, budget, sleep_schedule, cleanliness, smoking`,
      [city, budget, sleep_schedule, cleanliness, smoking, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
