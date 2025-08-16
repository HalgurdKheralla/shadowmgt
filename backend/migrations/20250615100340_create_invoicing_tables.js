// backend/migrations/your_timestamp_create_invoicing_tables.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Create the main 'invoices' table first
    .createTable('invoices', function(table) {
      table.increments('id').primary();

      table.integer('client_id').unsigned().notNullable();
      table.foreign('client_id').references('id').inTable('clients').onDelete('CASCADE');

      table.string('invoice_number').notNullable().unique();
      table.date('invoice_date').notNullable();
      table.date('due_date');
      table.string('status', 50).notNullable().defaultTo('Draft'); // e.g., Draft, Sent, Paid, Overdue

      table.decimal('subtotal', 14, 2).notNullable().defaultTo(0);
      table.decimal('discount', 14, 2).defaultTo(0);
      table.decimal('total', 14, 2).notNullable().defaultTo(0);
      table.string('currency', 10).notNullable().defaultTo('USD'); // e.g., USD, IQD

      table.text('notes');
      table.timestamps(true, true);
    })
    // Then, create the 'invoice_items' table that links orders to invoices
    .createTable('invoice_items', function(table) {
      table.increments('id').primary();

      table.integer('invoice_id').unsigned().notNullable();
      table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');

      table.integer('order_id').unsigned().notNullable();
      table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');

      // We can copy some data from the order for historical record keeping if needed
      table.string('description').notNullable();
      table.decimal('line_total', 14, 2).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Drop tables in reverse order of creation due to dependencies
  return knex.schema
    .dropTableIfExists('invoice_items')
    .dropTableIfExists('invoices');
};