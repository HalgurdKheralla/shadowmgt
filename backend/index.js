// backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // <-- Make sure dotenv is configured
const app = express();
const port = 5000;



// Import routes
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes'); // <-- Import client routes
const orderRoutes = require('./routes/orderRoutes'); // <-- Import order routes
const invoicingRoutes = require('./routes/invoicingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const accountingRoutes = require('./routes/accountingRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const codesRoutes = require('./routes/codesRoutes');


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- ROUTES ---
app.use('/api/users', userRoutes); // <-- Use the user routes
app.use('/api/clients', clientRoutes); // <-- Use the client routes
app.use('/api/clients/:clientId/orders', orderRoutes); // <-- Use the order routes
app.use('/api/invoicing', invoicingRoutes)
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees/:employeeId/payments', payrollRoutes); 
app.use('/api/reports', reportingRoutes);
app.use('/api/codes', codesRoutes);

app.get('/api', (req, res) => {
  res.json({ message: "Welcome to the Management System API!" });
});

// --- ERROR HANDLING ---
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
