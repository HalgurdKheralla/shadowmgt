// backend/controllers/clientController.js
const db = require('../db');

exports.getAllClients = async (req, res) => {
  try {
    const { search, currency } = req.query; // <-- Get currency from query

    const query = db('clients')
      .leftJoin('orders', 'clients.id', '=', 'orders.client_id')
      .select(
        'clients.id',
        'clients.company_name',
        'clients.contact_person',
        'clients.email',
        'clients.phone',
        'clients.city',
        'clients.client_type',
        'clients.primary_currency'
      )
      .count('orders.id as totalDeals')
      .groupBy('clients.id')
      .orderBy('clients.company_name');

    // --- NEW: Filter by currency if provided ---
    if (currency) {
      query.where('clients.primary_currency', currency);
    }

    if (search && search.trim() !== '') {
      query.where(function() {
        this.where('clients.company_name', 'ilike', `%${search}%`)
            .orWhere('clients.email', 'ilike', `%${search}%`)
            .orWhere('clients.contact_person', 'ilike', `%${search}%`);
      });
    }

    const clients = await query;
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error fetching clients.' });
  }
};

exports.getClientsWithOrderStats = async (req, res) => {
    const { currency } = req.query; // <-- Get currency from query
    try {
      const query = db('clients')
        .leftJoin('orders', 'clients.id', '=', 'orders.client_id')
        .select(
          'clients.id',
          'clients.company_name'
        )
        .count('orders.id as totalOrders')
        .max('orders.order_date as lastOrderDate')
        .groupBy('clients.id')
        .orderBy('clients.company_name');
  
      // --- NEW: Filter by currency if provided ---
      if (currency) {
        query.where('clients.primary_currency', currency);
      }
  
      const clientStats = await query;
      res.status(200).json(clientStats);
    } catch (error) {
      console.error('Error fetching clients with order stats:', error);
      res.status(500).json({ message: 'Server error fetching client stats.' });
    }
  };

exports.getSingleClient = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await db('clients').where({ id }).first();
        if (client) {
            res.status(200).json(client);
        } else {
            res.status(404).json({ message: 'Client not found.' });
        }
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Server error fetching client.' });
    }
};

exports.createClient = async (req, res) => {
    const { company_name, contact_person, email, phone, city, client_type, primary_currency } = req.body;
    if (!company_name || !client_type || !primary_currency) {
        return res.status(400).json({ message: 'Company name, client type, and primary currency are required.' });
    }
    try {
        const [newClient] = await db('clients').insert({
            company_name,
            contact_person,
            email,
            phone,
            city,
            client_type,
            primary_currency
        }).returning('*');
        res.status(201).json(newClient);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A client with this company name already exists.' });
        }
        console.error('Error creating client:', error);
        res.status(500).json({ message: 'Server error creating client.' });
    }
};

exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const [updatedClient] = await db('clients').where({ id }).update(updates).returning('*');
        if (updatedClient) {
            res.status(200).json(updatedClient);
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Server error updating client.' });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('clients').where({ id }).del();
        if (deletedCount > 0) {
            res.status(200).json({ message: 'Client deleted successfully' });
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({ message: 'Cannot delete client. They have existing orders linked to them.' });
        }
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Server error deleting client.' });
    }
};