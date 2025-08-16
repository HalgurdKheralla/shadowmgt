// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, dashboardController.getSummary);

// --- CORRECTED FUNCTION NAME IN THIS LINE ---
router.get('/daily-revenue', protect, dashboardController.getDailyOrderValueForCurrentMonth);

router.get('/revenue-by-location', protect, dashboardController.getRevenueByLocation);

module.exports = router;