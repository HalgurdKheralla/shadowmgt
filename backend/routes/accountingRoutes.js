// backend/routes/accountingRoutes.js
const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const { protect } = require('../middleware/authMiddleware');

// All accounting routes are protected
router.use(protect);

router.get('/accounts', accountingController.getChartOfAccounts);
router.get('/journal-entries', accountingController.getJournalEntries);
router.post('/journal-entries', accountingController.createJournalEntry);

module.exports = router;