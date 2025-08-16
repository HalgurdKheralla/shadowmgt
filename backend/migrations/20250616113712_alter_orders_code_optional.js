// backend/migrations/your_timestamp_alter_orders_code_optional.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('orders', function(table) {
    // Drop the unique constraint first
    table.dropUnique(['code']);
  }).then(function() {
    return knex.schema.alterTable('orders', function(table) {
      // Then make the column nullable
      table.string('code', 255).nullable().alter();
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Reverses the changes if needed
  return knex.schema.alterTable('orders', function(table) {
    table.string('code', 255).notNullable().unique().alter();
  });
};