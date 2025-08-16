// backend/migrations/your_timestamp_add_finish_date_to_orders.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('orders', function(table) {
    // Add the new finish_date column, allowing it to be null
    table.date('finish_date').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('orders', function(table) {
    // This will remove the column if we ever need to undo the migration
    table.dropColumn('finish_date');
  });
};