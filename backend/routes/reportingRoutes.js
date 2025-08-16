// backend/routes/reportingRoutes.js
const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all reporting routes

router.get('/profit-and-loss', reportingController.getProfitAndLoss);
router.get('/client-debts', reportingController.getClientDebts);

module.exports = router;