// backend/controllers/accountingController.js
const db = require('../db');

exports.createJournalEntry = async (req, res) => {
  const { entry_date, description, lines } = req.body;

  // --- Validation ---
  if (!entry_date || !description || !lines || lines.length < 2) {
    return res.status(400).json({ message: 'A journal entry requires a date, description, and at least two transaction lines.' });
  }

  let totalDebits = 0;
  let totalCredits = 0;
  for (const line of lines) {
    totalDebits += parseFloat(line.debit) || 0;
    totalCredits += parseFloat(line.credit) || 0;
  }

  // Use a small tolerance for floating point comparisons
  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    return res.status(400).json({ message: 'Debits and credits do not balance.' });
  }

  // --- Database Transaction ---
  try {
    await db.transaction(async (trx) => {
      // 1. Create the main journal entry record
      const [newEntry] = await trx('journal_entries').insert({
        entry_date,
        description
      }).returning('*');

      // 2. Prepare the transaction lines with the new entry's ID
      const linesToInsert = lines.map(line => ({
        journal_entry_id: newEntry.id,
        account_id: line.account_id,
        debit: line.debit || null,
        credit: line.credit || null,
      }));

      // 3. Insert all the transaction lines
      await trx('transaction_lines').insert(linesToInsert);
    });

    res.status(201).json({ message: 'Journal entry created successfully.' });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ message: 'Server error creating journal entry.' });
  }
};

// Add these new functions to backend/controllers/accountingController.js

// --- Get the entire Chart of Accounts ---
exports.getChartOfAccounts = async (req, res) => {
  try {
    const accounts = await db('chart_of_accounts').orderBy('account_code');
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    res.status(500).json({ message: 'Server error fetching accounts.' });
  }
};

// --- Get all Journal Entries with their lines (The General Ledger) ---
exports.getJournalEntries = async (req, res) => {
    try {
        // 1. Fetch all parent journal entries
        const entries = await db('journal_entries').orderBy('entry_date', 'desc');

        // 2. Fetch all transaction lines
        const lines = await db('transaction_lines').join('chart_of_accounts', 'transaction_lines.account_id', '=', 'chart_of_accounts.id').select('transaction_lines.*', 'chart_of_accounts.account_name');

        // 3. Map the lines to their parent entries
        const results = entries.map(entry => ({
            ...entry,
            lines: lines.filter(line => line.journal_entry_id === entry.id)
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Server error fetching journal entries.' });
    }
};