// backend/controllers/codesController.js
const db = require('../db');

exports.batchGenerateCodes = async (req, res) => {
    const { client_type, prefix, start_number, end_number } = req.body;

    // --- Validation ---
    if (!client_type || !prefix || !start_number || !end_number) {
        return res.status(400).json({ message: 'client_type, prefix, start_number, and end_number are required.' });
    }
    if (end_number < start_number) {
        return res.status(400).json({ message: 'End number must be greater than or equal to start number.' });
    }

    try {
        const codesToInsert = [];
        for (let i = start_number; i <= end_number; i++) {
            codesToInsert.push({
                code_value: `${prefix}${i}`,
                client_type: client_type,
                status: 'available',
            });
        }

        // Use a transaction to insert all codes at once
        await db.transaction(async (trx) => {
            await trx('codes').insert(codesToInsert);
        });

        res.status(201).json({ message: `Successfully generated ${codesToInsert.length} codes.` });

    } catch (error) {
        // Handle cases where a code already exists
        if (error.code === '23505') {
            return res.status(409).json({ message: 'One or more codes in the specified range already exist.' });
        }
        console.error('Error generating codes:', error);
        res.status(500).json({ message: 'Server error while generating codes.' });
    }
};

// Add this new function to backend/controllers/codesController.js

exports.getCodes = async (req, res) => {
    const { client_type, status, search } = req.query;

    try {
        const query = db('codes')
            // Join with orders to get the product description for 'used' codes
            .leftJoin('orders', 'codes.order_id', '=', 'orders.id')
            .select(
                'codes.*',
                'orders.product_description'
            )
            .orderBy('codes.id', 'asc');

        if (client_type) {
            query.where('codes.client_type', client_type);
        }
        if (status) {
            query.where('codes.status', status);
        }
        if (search && search.trim() !== '') {
            query.where(function() {
                this.where('codes.code_value', 'ilike', `%${search}%`)
                    .orWhere('orders.product_description', 'ilike', `%${search}%`);
            });
        }
        
        const codes = await query;
        res.status(200).json(codes);

    } catch (error) {
        console.error('Error fetching codes:', error);
        res.status(500).json({ message: 'Server error while fetching codes.' });
    }
};

// Add these new functions to backend/controllers/codesController.js

// --- Get the next single available code for a client type ---
exports.getNextAvailableCode = async (req, res) => {
    const { client_type } = req.query;
    if (!client_type) {
        return res.status(400).json({ message: 'client_type query parameter is required.' });
    }

    try {
        // This advanced query extracts the number from the code and sorts numerically
        const nextCode = await db('codes')
            .where({ client_type: client_type, status: 'available' })
            .orderByRaw('CAST(SUBSTRING(code_value FROM \'[0-9]+$\') AS INTEGER) ASC')
            .first();

        if (nextCode) {
            res.status(200).json(nextCode);
        } else {
            res.status(404).json({ message: `No available codes found for ${client_type}.` });
        }
    } catch (error) {
        console.error('Error fetching next available code:', error);
        res.status(500).json({ message: 'Server error fetching next available code.' });
    }
};

// --- Recycle a code (change status from 'recyclable' to 'available') ---
exports.recycleCode = async (req, res) => {
    const { id } = req.params;
    try {
        const [updatedCode] = await db('codes')
            .where({ id: id, status: 'recyclable' })
            .update({
                status: 'available'
            })
            .returning('*');

        if (updatedCode) {
            res.status(200).json({ message: 'Code has been recycled and is now available.', code: updatedCode });
        } else {
            res.status(404).json({ message: 'Code not found or is not in a recyclable state.' });
        }
    } catch (error) {
        console.error('Error recycling code:', error);
        res.status(500).json({ message: 'Server error recycling code.' });
    }
};