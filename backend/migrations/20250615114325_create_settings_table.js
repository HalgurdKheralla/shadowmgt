// backend/migrations/your_timestamp_create_settings_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('settings', function(table) {
      table.increments('id').primary();
      table.string('setting_key').notNullable().unique();
      table.string('setting_value').notNullable();
      table.timestamps(true, true);
    })
    .then(function() {
      // After creating the table, insert the default exchange rate setting
      return knex('settings').insert({
        setting_key: 'NORMAL_CLIENT_EXCHANGE_RATE',
        setting_value: '1450' // A default starting value
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};