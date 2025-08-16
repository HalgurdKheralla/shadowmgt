// backend/migrations/your_timestamp_add_primary_currency_to_clients.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('clients', function(table) {
    table.string('primary_currency', 3)
         .notNullable()
         .defaultTo('USD');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('clients', function(table) {
    table.dropColumn('primary_currency');
  });
};