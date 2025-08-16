const request = require('supertest');
const express = require('express');

const app = express();

app.get('/api', (req, res) => {
  res.json({ message: "Welcome to the Management System API!" });
});

describe('GET /api', () => {
  it('should respond with a welcome message', async () => {
    const response = await request(app).get('/api');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Welcome to the Management System API!');
  });
});
