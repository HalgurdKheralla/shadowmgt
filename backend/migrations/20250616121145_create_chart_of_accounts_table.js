// backend/migrations/your_timestamp_create_chart_of_accounts_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  
  const standardAccounts = [
    // Assets (1000s)
    { account_code: 1010, account_name: 'Cash', account_type: 'Asset' },
    { account_code: 1200, account_name: 'Accounts Receivable', account_type: 'Asset' },
    { account_code: 1500, account_name: 'Office Equipment', account_type: 'Asset' },
    // Liabilities (2000s)
    { account_code: 2010, account_name: 'Accounts Payable', account_type: 'Liability' },
    // Equity (3000s)
    { account_code: 3010, account_name: 'Owner Capital', account_type: 'Equity' },
    { account_code: 3200, account_name: 'Retained Earnings', account_type: 'Equity' },
    // Revenue (4000s)
    { account_code: 4010, account_name: 'Sales & Service Revenue', account_type: 'Revenue' },
    // Expenses (5000s)
    { account_code: 5010, account_name: 'Salaries Expense', account_type: 'Expense' },
    { account_code: 5020, account_name: 'Bonus & Commission Expense', account_type: 'Expense' },
    { account_code: 5100, account_name: 'Rent Expense', account_type: 'Expense' },
    { account_code: 5200, account_name: 'Office Supplies & Software', account_type: 'Expense' },
    { account_code: 5300, account_name: 'Utilities Expense', account_type: 'Expense' },
  ];

  return knex.schema
    .createTable('chart_of_accounts', function(table) {
      table.increments('id').primary();
      table.integer('account_code').notNullable().unique();
      table.string('account_name', 255).notNullable().unique();
      table.enum('account_type', accountTypes).notNullable();
      table.text('description');
      table.timestamps(true, true);
    })
    .then(function () {
      // After creating the table, insert the standard accounts
      return knex('chart_of_accounts').insert(standardAccounts);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chart_of_accounts');
};