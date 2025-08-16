// backend/services/accountingService.js
const db = require('../db');

async function createJournalEntry(entryData, trx) {
  const { entry_date, description, lines } = entryData;
  const dbOrTrx = trx || db; // Use the transaction if provided, otherwise use the global db object

  // --- Validation ---
  if (!entry_date || !description || !lines || lines.length < 2) {
    throw new Error('A journal entry requires a date, description, and at least two lines.');
  }

  let totalDebits = 0;
  let totalCredits = 0;
  for (const line of lines) {
    totalDebits += parseFloat(line.debit) || 0;
    totalCredits += parseFloat(line.credit) || 0;
  }

  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    throw new Error('Debits and credits do not balance.');
  }

  // --- Database Insertion ---
  // 1. Create the main journal entry record
  const [newEntry] = await dbOrTrx('journal_entries').insert({
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
  await dbOrTrx('transaction_lines').insert(linesToInsert);

  return newEntry;
}

module.exports = { createJournalEntry };