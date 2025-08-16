// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from './context/CurrencyContext';

// Import All Page Components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import OrdersSummaryPage from './pages/OrdersSummaryPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import Invoicing from './pages/Invoicing';
import InvoiceDetail from './pages/InvoiceDetail';
import Settings from './pages/Settings';
import ExpensesPage from './pages/Expenses';
import ChartOfAccounts from './pages/ChartOfAccounts';
import GeneralLedger from './pages/GeneralLedger';
import EmployeesPage from './pages/EmployeesPage';
import EmployeePayrollPage from './pages/EmployeePayrollPage';
import ProfitAndLossPage from './pages/ProfitAndLossPage';
import ClientDebtReportPage from './pages/ClientDebtReportPage';
import CodesPage from './pages/CodesPage';
import './App.css';

function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes nested inside the MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/orders" element={<OrdersSummaryPage />} />
              <Route path="/orders/:clientId" element={<ClientOrdersPage />} />
              <Route path="/codes" element={<CodesPage />} />
              <Route path="/invoicing" element={<Invoicing />} />
              <Route path="/invoicing/:id" element={<InvoiceDetail />} />
              <Route path="/reports/client-debts" element={<ClientDebtReportPage />} />
              <Route path="/accounting/reports/profit-and-loss" element={<ProfitAndLossPage />} />
              <Route path="/payroll/employees" element={<EmployeesPage />} />
              <Route path="/employees/:employeeId/payroll" element={<EmployeePayrollPage />} />
              <Route path="/accounting/expenses" element={<ExpensesPage />} />
              <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
              <Route path="/accounting/general-ledger" element={<GeneralLedger />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* Redirect root path to the dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  );
}

export default App;