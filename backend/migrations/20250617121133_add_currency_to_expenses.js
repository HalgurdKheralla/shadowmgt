// backend/migrations/your_timestamp_add_currency_to_expenses.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('expenses', function(table) {
    // Add the new currency column
    table.string('currency', 3)
         .notNullable()
         .defaultTo('USD');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('expenses', function(table) {
    table.dropColumn('currency');
  });
};