// backend/migrations/your_timestamp_create_payroll_tables.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // First, create a simple table for employees
    .createTable('employees', function(table) {
      table.increments('id').primary();
      table.string('full_name').notNullable();
      table.string('position').nullable();
      table.date('hire_date').notNullable();
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamps(true, true);
    })
    // Then, create the table for individual salary payments
    .createTable('salary_payments', function(table) {
      table.increments('id').primary();

      table.integer('employee_id').unsigned().notNullable();
      table.foreign('employee_id').references('id').inTable('employees').onDelete('CASCADE');

      table.date('payment_date').notNullable();
      table.date('pay_period_start').notNullable();
      table.date('pay_period_end').notNullable();

      table.decimal('base_salary', 14, 2).notNullable();
      table.decimal('bonuses', 14, 2).defaultTo(0);
      table.decimal('deductions', 14, 2).defaultTo(0);
      table.decimal('net_pay', 14, 2).notNullable();

      table.integer('payment_account_id').unsigned().notNullable();
      table.foreign('payment_account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');

      table.text('notes');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Drop tables in reverse order of creation
  return knex.schema
    .dropTableIfExists('salary_payments')
    .dropTableIfExists('employees');
};