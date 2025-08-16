// backend/routes/invoicingRoutes.js
const express = require('express');
const router = express.Router();
const invoicingController = require('../controllers/invoicingController');
const { protect } = require('../middleware/authMiddleware');

// Matches GET /api/invoicing/
router.get('/', protect, invoicingController.getAllInvoices);

// Matches POST /api/invoicing/generate
router.post('/generate', protect, invoicingController.generateInvoices);

// Specific route first: Matches GET /api/invoicing/:id/download
router.get('/:id/download', protect, invoicingController.downloadInvoicePdf);

// Generic route last: Matches GET /api/invoicing/:id
router.get('/:id', protect, invoicingController.getSingleInvoice);

router.patch('/:id/status', protect, invoicingController.updateInvoiceStatus);



    
module.exports = router;