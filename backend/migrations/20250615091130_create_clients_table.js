// backend/migrations/your_timestamp_create_clients_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('clients', function(table) {
    table.increments('id').primary();
    table.string('company_name', 255).notNullable().unique();
    table.string('contact_person', 255);
    table.string('phone', 50);
    table.string('email', 255);
    table.string('city', 255);

    // For handling different invoice logic and templates
    table.string('client_type', 50).notNullable().defaultTo('Normal'); // e.g., 'Normal', 'Royal Can RB', 'Royal Can RS'
    table.string('default_invoice_template', 100); // e.g., 'normal.pdf', 'RB.pdf'

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('clients');
};