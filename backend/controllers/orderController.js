// backend/controllers/orderController.js
const db = require('../db');

// --- Get all orders for a specific client ---
// In backend/controllers/orderController.js
// Replace the existing getOrdersForClient function

exports.getOrdersForClient = async (req, res) => {
  const { clientId } = req.params;
  const { search } = req.query; // Get search term from URL query

  try {
    const query = db('orders')
      .join('clients', 'orders.client_id', '=', 'clients.id') // Join with clients table
      .where({ client_id: clientId })
      .select('orders.*', 'clients.client_type') // Select all order fields AND the client_type
      .orderBy('order_date', 'desc');

    // If a search term is provided, add filtering conditions
    if (search && search.trim() !== '') {
      query.where(function() {
        this.where('code', 'ilike', `%${search}%`)
            .orWhere('product_description', 'ilike', `%${search}%`);
      });
    }

    const orders = await query;
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};


// In backend/controllers/orderController.js
// Replace the existing createOrderForClient function

exports.createOrderForClient = async (req, res) => {
  const { clientId } = req.params;
  let { code_id, ...orderData } = req.body;
  
  if (!orderData.order_date || !orderData.product_description) {
    return res.status(400).json({ message: 'Order date and product description are required.' });
  }

  try {
    const client = await db('clients').where({ id: clientId }).first();
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    if (client.client_type !== 'Normal' && !code_id) {
      return res.status(400).json({ message: 'A code selection is required for this client type.' });
    }

    const newOrder = await db.transaction(async (trx) => {
      let finalPayload = { ...orderData, client_id: parseInt(clientId, 10) };
      if (finalPayload.finish_date === '') { finalPayload.finish_date = null; }
      delete finalPayload.total_cost_usd;
      delete finalPayload.cost_usd;
      delete finalPayload.cost_iqd;

      if (code_id) {
        const selectedCode = await trx('codes').where({ id: code_id }).forUpdate().first();
        if (!selectedCode || selectedCode.status !== 'available') {
          throw new Error('Selected code is not available. Please refresh and choose another.');
        }
        finalPayload.code_id = code_id;
        finalPayload.code = selectedCode.code_value;
      } else {
        finalPayload.code = `ORD-${Date.now()}`;
      }
      
      const [insertedOrder] = await trx('orders').insert(finalPayload).returning('*');
      if (code_id) {
        await trx('codes').where({ id: code_id }).update({ status: 'used', order_id: insertedOrder.id });
      }
      return insertedOrder;
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Server error creating order.' });
  }
};

// --- Update an existing order ---
// Replace the existing updateOrder function in backend/controllers/orderController.js

// In backend/controllers/orderController.js
// Replace the existing updateOrder function

// In backend/controllers/orderController.js
// Replace the existing updateOrder function with this one

// In backend/controllers/orderController.js
// Replace the existing updateOrder function with this one

// In backend/controllers/orderController.js
// Replace the existing updateOrder function

// In backend/controllers/orderController.js
// Replace the existing updateOrder function

// In backend/controllers/orderController.js
// Replace the existing updateOrder function

exports.updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const updates = req.body;
  const userId = req.user.id;

  try {
    await db.transaction(async (trx) => {
      const currentOrder = await trx('orders').where({ id: orderId }).first();
      if (!currentOrder) {
        throw new Error('Order not found');
      }

      // Check if the code is being changed
      if (updates.code_id && updates.code_id !== currentOrder.code_id) {
        // Release the OLD code
        if (currentOrder.code_id) {
          await trx('codes').where({ id: currentOrder.code_id }).update({ status: 'recyclable', order_id: null });
        }
        
        // Reserve the NEW code
        const newCodeToAssign = await trx('codes').where({ id: updates.code_id, status: 'available' }).first();
        if (!newCodeToAssign) {
          throw new Error('Selected code is no longer available.');
        }
        await trx('codes').where({ id: updates.code_id }).update({ status: 'used', order_id: orderId });
        
        // --- THIS IS THE MISSING PIECE ---
        // Log the change to our history table
        await trx('order_code_history').insert({
          order_id: orderId,
          changed_by_user_id: userId,
          old_code: currentOrder.code,
          new_code: newCodeToAssign.code_value,
        });

        updates.code = newCodeToAssign.code_value;
      }

      // Sanitize the payload before the final update
      delete updates.client_type;
      delete updates.client_name;
      delete updates.total_cost_usd;
      if (updates.finish_date === '') {
        updates.finish_date = null;
      }

      const [updatedOrder] = await trx('orders')
        .where({ id: orderId })
        .update(updates)
        .returning('*');
      
      res.status(200).json(updatedOrder);
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: error.message || 'Server error updating order.' });
  }
};

// --- Delete an order ---
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const deletedCount = await db('orders').where({ id: orderId }).del();

    if (deletedCount > 0) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error deleting order.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { is_approved } = req.body;

  if (typeof is_approved !== 'boolean') {
    return res.status(400).json({ message: 'is_approved boolean value is required.' });
  }

  try {
    const [updatedOrder] = await db('orders')
      .where({ id: orderId })
      .update({ is_approved })
      .returning('*');

    if (updatedOrder) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status.' });
  }
};

// Add this new function to backend/controllers/orderController.js

// Add this new function to backend/controllers/orderController.js

exports.getOrderCodeHistory = async (req, res) => {
    const { orderId } = req.params;
    try {
        const history = await db('order_code_history')
            .join('users', 'order_code_history.changed_by_user_id', '=', 'users.id')
            .where({ order_id: orderId })
            .select('order_code_history.*', 'users.name as user_name')
            .orderBy('changed_at', 'desc');
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ message: 'Server error fetching order history.' });
    }
};