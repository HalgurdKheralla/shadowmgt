// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all employee routes

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);

router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.get('/:id', employeeController.getSingleEmployee);

module.exports = router;