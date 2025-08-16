// backend/migrations/your_timestamp_add_arabic_description_to_orders.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('orders', function(table) {
    // Add the new column for the Arabic product name
    table.string('product_description_ar').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('orders', function(table) {
    table.dropColumn('product_description_ar');
  });
};