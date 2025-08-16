// backend/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware'); // Import our new middleware


// Apply the 'protect' middleware to all client routes
// Any request to these routes must have a valid token

router.post('/', protect, clientController.createClient);
router.get('/', protect, clientController.getAllClients);

router.get('/summary/orders', clientController.getClientsWithOrderStats);


router.get('/:id', protect, clientController.getSingleClient);
router.put('/:id', protect, clientController.updateClient);
router.delete('/:id', protect, clientController.deleteClient);


module.exports = router;