// backend/migrations/your_timestamp_create_ledger_tables.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // First, create the 'journal_entries' table
    .createTable('journal_entries', function(table) {
      table.increments('id').primary();
      table.date('entry_date').notNullable();
      table.string('description').notNullable();
      table.timestamps(true, true);
    })
    // Then, create the 'transaction_lines' table which links to the other two
    .createTable('transaction_lines', function(table) {
      table.increments('id').primary();
      
      table.integer('journal_entry_id').unsigned().notNullable();
      table.foreign('journal_entry_id').references('id').inTable('journal_entries').onDelete('CASCADE');

      table.integer('account_id').unsigned().notNullable();
      // This prevents an account from being deleted if it has transactions, ensuring data integrity
      table.foreign('account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');

      table.decimal('debit', 14, 2);
      table.decimal('credit', 14, 2);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Drop tables in reverse order of creation
  return knex.schema
    .dropTableIfExists('transaction_lines')
    .dropTableIfExists('journal_entries');
};