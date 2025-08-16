// backend/migrations/your_timestamp_create_codes_inventory.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // First, create the new master 'codes' table
    .createTable('codes', function(table) {
      table.increments('id').primary();
      table.string('code_value').notNullable().unique();
      table.enum('client_type', ['Royal Can', 'Karwanchi', 'Zain Group']).notNullable();
      table.enum('status', ['available', 'used', 'recyclable']).notNullable().defaultTo('available');
      
      // A nullable link to the order that is currently using this code
      table.integer('order_id').unsigned().nullable();
      table.foreign('order_id').references('id').inTable('orders').onDelete('SET NULL');

      table.timestamps(true, true);
    })
    // Then, alter the existing 'orders' table
    .alterTable('orders', function(table) {
      // We will add a 'code_id' foreign key. It can be null for Normal Clients.
      table.integer('code_id').unsigned().nullable();
      table.foreign('code_id').references('id').inTable('codes').onDelete('SET NULL');

      // We make the old 'code' column nullable as it will no longer be the primary source
      table.string('code').nullable().alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // To reverse, we drop the new columns and table
  return knex.schema.alterTable('orders', function(table) {
    table.dropColumn('code_id');
  }).then(function() {
    return knex.schema.dropTableIfExists('codes');
  });
};