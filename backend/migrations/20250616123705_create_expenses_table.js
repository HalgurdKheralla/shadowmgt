// backend/migrations/your_timestamp_create_expenses_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('expenses', function(table) {
    table.increments('id').primary();
    table.date('expense_date').notNullable();
    table.string('description').notNullable();
    table.decimal('amount', 14, 2).notNullable();
    table.string('vendor').nullable();

    // This links to the expense category, e.g., "Rent Expense"
    table.integer('expense_account_id').unsigned().notNullable();
    table.foreign('expense_account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');

    // This links to the account the money came from, e.g., "Cash"
    table.integer('payment_account_id').unsigned().notNullable();
    table.foreign('payment_account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');

    table.text('notes');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('expenses');
};