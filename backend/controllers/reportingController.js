// backend/controllers/reportingController.js
const db = require('../db');

exports.getProfitAndLoss = async (req, res) => {
    const { startDate, endDate, currency } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate query parameters are required.' });
    }

    try {
        // --- Run queries for Revenue and Expenses concurrently ---
        const [revenueResult, expenseBreakdown] = await Promise.all([
            // 1. Calculate Total Revenue - This query is now filtered by currency
            (() => {
                const revenueQuery = db('invoices')
                    .join('clients', 'invoices.client_id', '=', 'clients.id')
                    .where('invoices.status', 'Paid')
                    .andWhereBetween('invoices.invoice_date', [startDate, endDate])
                    .sum('invoices.total as totalRevenue')
                    .first();
                
                // --- NEW: Apply currency filter to revenue ---
                if (currency) {
                    revenueQuery.where('clients.primary_currency', currency);
                }
                return revenueQuery;
            })(),

            // 2. Calculate a breakdown of all expenses
            // Expenses are company-wide and not filtered by client currency
            db('transaction_lines as tl')
                .join('chart_of_accounts as coa', 'tl.account_id', '=', 'coa.id')
                .join('journal_entries as je', 'tl.journal_entry_id', '=', 'je.id')
                .select('coa.account_name')
                .sum('tl.debit as total')
                .where('coa.account_type', 'Expense')
                .andWhereBetween('je.entry_date', [startDate, endDate])
                .groupBy('coa.account_name')
        ]);

        const totalRevenue = parseFloat(revenueResult.totalRevenue) || 0;
        const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const netProfit = totalRevenue - totalExpenses;

        res.status(200).json({
            startDate,
            endDate,
            totalRevenue,
            expenseBreakdown,
            totalExpenses,
            netProfit
        });

    } catch (error) {
        console.error('Error generating P&L report:', error);
        res.status(500).json({ message: 'Server error generating report.' });
    }
};

exports.getClientDebts = async (req, res) => {
    const { search, currency } = req.query; // <-- Get currency from query
    try {
      const query = db('clients')
        .leftJoin('invoices', function() {
          this.on('clients.id', '=', 'invoices.client_id')
              .andOnNotIn('invoices.status', ['Paid']);
        })
        .select(
          'clients.id as clientId',
          'clients.company_name'
        )
        .sum('invoices.total as totalDebt')
        .groupBy('clients.id', 'clients.company_name')
        .orderBy('clients.company_name');
  
      // --- NEW: Filter by currency if provided ---
      if (currency) {
        query.where('clients.primary_currency', currency);
      }
      
      if (search && search.trim() !== '') {
        query.where('clients.company_name', 'ilike', `%${search}%`);
      }
  
      const clientDebts = await query;
      
      const results = clientDebts.map(client => ({
          ...client,
          totalDebt: parseFloat(client.totalDebt) || 0
      }));
  
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching client debts:', error);
      res.status(500).json({ message: 'Server error fetching client debts.' });
    }
};