// backend/controllers/settingsController.js
const db = require('../db');

// --- Get a setting by its key ---
exports.getSetting = async (req, res) => {
  const { key } = req.params;
  try {
    const setting = await db('settings').where({ setting_key: key }).first();
    if (setting) {
      res.status(200).json(setting);
    } else {
      res.status(404).json({ message: 'Setting not found.' });
    }
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Server error fetching setting.' });
  }
};

// --- Update a setting by its key ---
exports.updateSetting = async (req, res) => {
  const { key } = req.params;
  const { setting_value } = req.body;

  if (setting_value === undefined) {
    return res.status(400).json({ message: 'setting_value is required.' });
  }

  try {
    const [updatedSetting] = await db('settings')
      .where({ setting_key: key })
      .update({ setting_value })
      .returning('*');
    
    if (updatedSetting) {
      res.status(200).json(updatedSetting);
    } else {
      res.status(404).json({ message: 'Setting not found to update.' });
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error updating setting.' });
  }
};