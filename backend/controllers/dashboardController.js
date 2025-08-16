// backend/controllers/dashboardController.js
const db = require('../db');

exports.getSummary = async (req, res) => {
  const { currency } = req.query;
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Base query for clients, which we will use for filtering
    const clientQuery = db('clients');
    if (currency) {
      clientQuery.where('primary_currency', currency);
    }
    const clientIds = await clientQuery.pluck('id');

    // If there are no clients for the selected currency, return zero for all metrics
    if (clientIds.length === 0) {
        return res.status(200).json({
            totalSales: 0,
            revenue: 0,
            totalCustomers: 0,
            totalOrders: 0,
        });
    }

    // 1. Total Sales (Sum of all invoices for clients in the selected currency)
    const totalSales = await db('invoices').whereIn('client_id', clientIds).sum({ total: 'total' }).first();

    // 2. Revenue (Sum of only 'Paid' invoices for these clients)
    const revenue = await db('invoices').whereIn('client_id', clientIds).andWhere('status', 'Paid').sum({ total: 'total' }).first();
    
    // 3. Customers (Total count of clients for the selected currency)
    const totalCustomers = clientIds.length;
    
    // 4. Orders (Total count of orders for these clients)
    const totalOrders = await db('orders').whereIn('client_id', clientIds).count({ count: 'id' }).first();

    res.status(200).json({
      totalSales: totalSales.total || 0,
      revenue: revenue.total || 0,
      totalCustomers: totalCustomers || 0,
      totalOrders: totalOrders.count || 0,
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error fetching dashboard summary.' });
  }
};

exports.getDailyOrderValueForCurrentMonth = async (req, res) => {
    const { currency } = req.query;
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const query = db('orders')
            .select(
                db.raw('EXTRACT(DAY FROM order_date) as day'),
                db.raw('SUM(COALESCE(design_cost_usd, 0) + COALESCE(separation_cost_usd, 0)) as value')
            )
            .whereRaw('EXTRACT(YEAR FROM order_date) = ?', [year])
            .whereRaw('EXTRACT(MONTH FROM order_date) = ?', [month]);

        // --- NEW: Join with clients to filter by currency ---
        if (currency) {
            query.join('clients', 'orders.client_id', '=', 'clients.id')
                 .where('clients.primary_currency', currency);
        }

        const dailyOrderValue = await query.groupBy('day').orderBy('day');
      
        const daysInMonth = new Date(year, month, 0).getDate();
        const valueData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData = dailyOrderValue.find(d => Number(d.day) === day);
            return dayData ? parseFloat(String(dayData.value)) : 0;
        });

        res.status(200).json({
            labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            data: valueData,
        });

    } catch (error) {
        console.error('Error fetching daily order value:', error);
        res.status(500).json({ message: 'Server error fetching daily order value.' });
    }
};

exports.getRevenueByLocation = async (req, res) => {
    const { currency } = req.query;
    try {
        const query = db('invoices')
            .join('clients', 'invoices.client_id', '=', 'clients.id')
            .select('clients.city')
            .sum('invoices.total as totalRevenue')
            .where('invoices.status', 'Paid')
            .whereNotNull('clients.city');

        // --- NEW: Filter by currency ---
        if (currency) {
            query.where('clients.primary_currency', currency);
        }

        const revenueByCity = await query
            .groupBy('clients.city')
            .orderBy('totalRevenue', 'desc')
            .limit(5);

        res.status(200).json(revenueByCity);
    } catch (error) {
        console.error('Error fetching revenue by location:', error);
        res.status(500).json({ message: 'Server error fetching revenue by location.' });
    }
};