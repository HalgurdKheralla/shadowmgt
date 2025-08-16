// backend/controllers/expenseController.js
const db = require('../db');
const { createJournalEntry } = require('../services/accountingService');

exports.createExpense = async (req, res) => {
  const {
    expense_date,
    description,
    amount,
    vendor,
    expense_account_id,
    currency, // <-- NEW: We now accept currency
    notes
  } = req.body;

  if (!expense_date || !description || !amount || !expense_account_id || !currency) {
    return res.status(400).json({ message: 'Date, description, amount, expense category, and currency are required.' });
  }

  try {
    const newExpense = await db.transaction(async (trx) => {
      // Based on the currency, find the correct cash account to pay from
      const paymentAccount = await trx('chart_of_accounts')
        .where({ account_name: `Cash - ${currency}` })
        .first();

      if (!paymentAccount) {
        throw new Error(`Payment account 'Cash - ${currency}' not found in Chart of Accounts.`);
      }

      const [insertedExpense] = await trx('expenses').insert({
        expense_date,
        description,
        amount,
        vendor,
        expense_account_id,
        payment_account_id: paymentAccount.id, // Use the ID we just found
        currency, // Save the currency with the expense
        notes
      }).returning('*');

      const entryData = {
        entry_date: expense_date,
        description: `Expense: ${description}`,
        lines: [
          { account_id: expense_account_id, debit: amount, credit: null },
          { account_id: paymentAccount.id, debit: null, credit: amount }
        ]
      };

      await createJournalEntry(entryData, trx);
      return insertedExpense;
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: error.message || 'Server error while creating expense.' });
  }
};

exports.getAllExpenses = async (req, res) => {
    try {
        // Query 1: Get the list of individual expense records
        const expenses = await db('expenses')
            .join('chart_of_accounts as expense_acct', 'expenses.expense_account_id', '=', 'expense_acct.id')
            .join('chart_of_accounts as payment_acct', 'expenses.payment_account_id', '=', 'payment_acct.id')
            .select(
                'expenses.*',
                'expense_acct.account_name as expense_category',
                'payment_acct.account_name as paid_from_account'
            )
            .orderBy('expenses.expense_date', 'desc');
        
        // Query 2: Get the aggregated totals
        const totals = await db('expenses')
            .select(
                db.raw("SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) as totalUSD"),
                db.raw("SUM(CASE WHEN currency = 'IQD' THEN amount ELSE 0 END) as totalIQD")
            )
            .first();

        // Send both the list and the totals back
        res.status(200).json({
            expenses,
            totals
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error fetching expenses.' });
    }
};