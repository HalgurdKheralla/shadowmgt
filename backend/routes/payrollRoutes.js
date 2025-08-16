// backend/routes/payrollRoutes.js
const express = require('express');
// This allows this router to access params from parent routers (i.e., :employeeId)
const router = express.Router({ mergeParams: true });
const payrollController = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', payrollController.createSalaryPayment);
router.get('/', payrollController.getSalaryPaymentsForEmployee);

module.exports = router;