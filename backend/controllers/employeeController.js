// backend/controllers/employeeController.js
const db = require('../db');

// Get all active employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await db('employees').where({ is_active: true }).orderBy('full_name');
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error fetching employees.' });
    }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
    const { full_name, position, hire_date } = req.body;
    if (!full_name || !hire_date) {
        return res.status(400).json({ message: 'Full name and hire date are required.' });
    }
    try {
        const [newEmployee] = await db('employees').insert({ full_name, position, hire_date }).returning('*');
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error creating employee.' });
    }
};

// NOTE: We can add update and delete functions here later if needed.
// For now, we will focus on creating and listing.

// Add these functions to backend/controllers/employeeController.js

// --- Update an existing employee ---
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { full_name, position, hire_date, is_active } = req.body;
    if (!full_name || !hire_date) {
        return res.status(400).json({ message: 'Full name and hire date are required.' });
    }
    try {
        const [updatedEmployee] = await db('employees').where({ id }).update({ full_name, position, hire_date, is_active }).returning('*');
        if (updatedEmployee) {
            res.status(200).json(updatedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found.' });
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error updating employee.' });
    }
};

// --- Delete an employee ---
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('employees').where({ id }).del();
        if (deletedCount > 0) {
            res.status(200).json({ message: 'Employee deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Employee not found.' });
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error deleting employee.' });
    }
};

// --- Get a single employee by ID ---
exports.getSingleEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await db('employees').where({ id }).first();
        if (employee) {
            res.status(200).json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found.' });
        }
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ message: 'Server error fetching employee.' });
    }
};