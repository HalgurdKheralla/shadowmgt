// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Apply 'protect' middleware to all order routes
router.use(protect);

// Routes for the collection of orders for a client
// GET /api/clients/:clientId/orders
// POST /api/clients/:clientId/orders
router.get('/', orderController.getOrdersForClient);
router.post('/', orderController.createOrderForClient);

// Routes for a single, specific order
// All these routes now have the protect middleware implicitly applied by router.use(protect) above
// and will correctly have access to req.user
router.put('/:orderId', orderController.updateOrder);
router.delete('/:orderId', orderController.deleteOrder);
router.patch('/:orderId/status', orderController.updateOrderStatus);
router.get('/:orderId/history', orderController.getOrderCodeHistory);
router.patch('/:orderId/status', orderController.updateOrderStatus);


module.exports = router;