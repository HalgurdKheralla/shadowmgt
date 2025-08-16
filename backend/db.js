// backend/db.js
const knex = require('knex');
const knexConfig = require('./knexfile');

// We are using the "development" configuration from our knexfile
const db = knex(knexConfig.development);

module.exports = db;