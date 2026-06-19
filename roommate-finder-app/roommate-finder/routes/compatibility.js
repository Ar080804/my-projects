const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/compatibility/:tenantId - Calculate compatibility score between logged-in tenant and another tenant
router.get('/:tenantId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherTenantId = req.params.tenantId;

    const result = await pool.query(
      'SELECT id, city, budget, sleep_schedule, cleanliness, smoking FROM users WHERE id IN ($1, $2)',
      [currentUserId, otherTenantId]
    );

    if (result.rows.length < 2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const currentUser = result.rows.find(u => u.id == currentUserId);
    const otherUser = result.rows.find(u => u.id == otherTenantId);

    let matchScore = 0;
    let totalCriteria = 0;

    // City Match (20 points)
    if (currentUser.city && otherUser.city) {
      totalCriteria += 20;
      if (currentUser.city.toLowerCase() === otherUser.city.toLowerCase()) matchScore += 20;
    }

    // Budget Range Match - within 20% difference (20 points)
    if (currentUser.budget && otherUser.budget) {
      totalCriteria += 20;
      const diff = Math.abs(currentUser.budget - otherUser.budget);
      const maxAllowedDiff = Math.max(currentUser.budget, otherUser.budget) * 0.20;
      if (diff <= maxAllowedDiff) matchScore += 20;
    }

    // Sleep Schedule Match (20 points)
    if (currentUser.sleep_schedule && otherUser.sleep_schedule) {
      totalCriteria += 20;
      if (currentUser.sleep_schedule === otherUser.sleep_schedule) matchScore += 20;
    }

    // Cleanliness Match (20 points)
    if (currentUser.cleanliness && otherUser.cleanliness) {
      totalCriteria += 20;
      if (currentUser.cleanliness === otherUser.cleanliness) matchScore += 20;
    }

    // Smoking Preference Match (20 points)
    if (currentUser.smoking !== null && otherUser.smoking !== null) {
      totalCriteria += 20;
      if (currentUser.smoking === otherUser.smoking) matchScore += 20;
    }

    const compatibilityScore = totalCriteria > 0 ? Math.round((matchScore / totalCriteria) * 100) : 0;

    res.json({ tenant1: currentUserId, tenant2: parseInt(otherTenantId), compatibilityScore });
  } catch (err) {
    res.status(500).json({ error: 'Server error calculating compatibility' });
  }
});

module.exports = router;
