// backend/migrations/your_timestamp_create_order_code_history_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_code_history', function(table) {
    table.increments('id').primary();

    table.integer('order_id').unsigned().notNullable();
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');

    table.integer('changed_by_user_id').unsigned().notNullable();
    table.foreign('changed_by_user_id').references('id').inTable('users').onDelete('SET NULL');

    table.string('old_code').notNullable();
    table.string('new_code').notNullable();

    table.timestamp('changed_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_code_history');
};