// backend/controllers/payrollController.js
const db = require('../db');
const { createJournalEntry } = require('../services/accountingService');

// In backend/controllers/payrollController.js
// Replace the existing createSalaryPayment function

// In backend/controllers/payrollController.js
// Replace the existing createSalaryPayment function

exports.createSalaryPayment = async (req, res) => {
    const { employeeId } = req.params;
    const { 
        payment_date, 
        pay_period_start, 
        pay_period_end,
        base_salary,
        bonuses,
        deductions,
        payment_account_id
    } = req.body;

    if (!payment_date || !pay_period_start || !pay_period_end || !base_salary || !payment_account_id) {
        return res.status(400).json({ message: 'Payment date, pay period, base salary, and payment account are required.' });
    }

    const baseSalaryNum = parseFloat(base_salary) || 0;
    const bonusesNum = parseFloat(bonuses) || 0;
    const deductionsNum = parseFloat(deductions) || 0;
    const net_pay = baseSalaryNum + bonusesNum - deductionsNum;

    try {
        await db.transaction(async (trx) => {
            await trx('salary_payments').insert({
                employee_id: employeeId,
                payment_date,
                pay_period_start,
                pay_period_end,
                base_salary: baseSalaryNum,
                bonuses: bonusesNum,
                deductions: deductionsNum,
                net_pay,
                payment_account_id
            });

            const paymentAccount = await trx('chart_of_accounts').where({ id: payment_account_id }).first();
            const salaryExpenseAccount = await trx('chart_of_accounts').where({ account_name: 'Salaries Expense' }).first();
            const bonusExpenseAccount = await trx('chart_of_accounts').where({ account_name: 'Bonus & Commission Expense' }).first();
            const deductionsPayableAccount = await trx('chart_of_accounts').where({ account_name: 'Deductions Payable' }).first();

            if (!paymentAccount || !salaryExpenseAccount || !bonusExpenseAccount || !deductionsPayableAccount) {
                throw new Error('Core payroll accounts not found in Chart of Accounts.');
            }

            const lines = [
                // Debit (Expense) for the full base salary
                { account_id: salaryExpenseAccount.id, debit: baseSalaryNum, credit: null },
                // Credit (Asset Decrease) for the actual cash paid out
                { account_id: paymentAccount.id, debit: null, credit: net_pay }
            ];

            // If there's a bonus, add it as another debit
            if (bonusesNum > 0) {
                lines.push({ account_id: bonusExpenseAccount.id, debit: bonusesNum, credit: null });
            }

            // If there are deductions, credit the liability account
            if (deductionsNum > 0) {
                lines.push({ account_id: deductionsPayableAccount.id, debit: null, credit: deductionsNum });
            }

            const entryData = {
                entry_date: payment_date,
                description: `Payroll for employee ID ${employeeId}`,
                lines: lines
            };

            await createJournalEntry(entryData, trx);
        });

        res.status(201).json({ message: 'Salary payment recorded successfully.' });

    } catch (error) {
        console.error("Error creating salary payment:", error);
        res.status(500).json({ message: error.message || 'Server error while creating salary payment.' });
    }
};

// We can add a function to get all payments for an employee later
exports.getSalaryPaymentsForEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const payments = await db('salary_payments').where({ employee_id: employeeId }).orderBy('payment_date', 'desc');
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching salary payments:', error);
        res.status(500).json({ message: 'Server error fetching salary payments.' });
    }
};