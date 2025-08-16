// backend/controllers/userController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Import jsonwebtoken

// ... your existing register function is here ...

exports.register = async (req, res) => {
    // ... (no changes to this function)
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await db('users').insert({ name, email, password_hash }).returning(['id', 'name', 'email']);
        res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// --- NEW LOGIN FUNCTION ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find the user by their email
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // If credentials are correct, create a JWT
        const payload = {
            id: user.id,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        res.status(200).json({ message: 'Login successful', token: token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};