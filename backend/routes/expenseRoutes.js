// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all expense routes

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);

module.exports = router;