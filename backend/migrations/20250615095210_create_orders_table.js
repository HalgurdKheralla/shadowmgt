// backend/migrations/your_timestamp_create_orders_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id').primary();

    // Link to the clients table
    table.integer('client_id').unsigned().notNullable();
    table.foreign('client_id').references('id').inTable('clients').onDelete('CASCADE');

    // Core Order Details
    table.date('order_date').notNullable();
    table.string('code', 255).notNullable().unique();
    table.string('product_description', 255).notNullable();
    table.string('size', 100);
    table.text('notes');

    // Cost fields based on invoice analysis 
    table.decimal('design_cost_usd', 14, 2).defaultTo(0);
    table.decimal('separation_cost_usd', 14, 2).defaultTo(0);
    table.decimal('separation_cost_iqd', 14, 2).defaultTo(0);

    // Special fields for Royal Can logic
    table.string('billing_branch', 50); // For 'RS' or 'RB'
    table.string('end_customer_name', 255); // For line items on RS/RB invoices 

    // Status Checkboxes
    table.boolean('is_approved').defaultTo(false);
    table.boolean('printing_files_sent').defaultTo(false);
    table.boolean('is_invoiced').defaultTo(false);
    table.boolean('is_paid').defaultTo(false);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};