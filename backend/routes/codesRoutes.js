// backend/routes/codesRoutes.js
const express = require('express');
const router = express.Router();
const codesController = require('../controllers/codesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all code management routes

router.post('/batch-generate', codesController.batchGenerateCodes);
router.get('/', codesController.getCodes);
router.get('/next-available', codesController.getNextAvailableCode);
router.patch('/:id/recycle', codesController.recycleCode); // Using PATCH as it's an update


module.exports = router;