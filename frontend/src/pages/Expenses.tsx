// frontend/src/pages/ExpensesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';

// --- TYPE DEFINITIONS ---
interface Account {
  id: number;
  account_name: string;
  account_type: string;
}
interface Expense {
  id: number;
  expense_date: string;
  description: string;
  amount: number;
  vendor: string;
  expense_category: string;
  currency: 'USD' | 'IQD';
}
interface Totals {
    totalUSD: string;
    totalIQD: string;
}
const initialState = {
  expense_date: new Date().toISOString().split('T')[0],
  description: '',
  amount: 0,
  vendor: '',
  expense_account_id: 0,
  currency: 'USD' as 'USD' | 'IQD',
  notes: '',
};

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<Totals>({ totalUSD: "0", totalIQD: "0" });
  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/expenses'),
      api.get('/accounting/accounts')
    ]).then(([expenseData, accountsData]) => {
      setExpenses(expenseData.expenses);
      setTotals(expenseData.totals);
      setExpenseAccounts(accountsData.filter((acc: Account) => acc.account_type === 'Expense'));
    }).catch(err => {
      toast.error("Could not load expenses data.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.expense_account_id || formData.expense_account_id === 0) {
      return toast.error('Please select an expense category.');
    }
    toast.promise(
        api.post('/expenses', formData),
        {
            loading: 'Recording expense...',
            success: () => {
                fetchData(); // Refresh the list and totals
                setFormData(initialState);
                return 'Expense recorded successfully!';
            },
            error: (err) => (err as Error).message || 'Failed to record expense.'
        }
    );
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Business Expenses</h1>
        <p>Record and track all company expenses.</p>
      </div>
      
      {/* Totals Display using Stat Card styling */}
      <div className="dashboard-grid" style={{marginBottom: '2em'}}>
        <div className="stat-card">
            <h3>Total USD Expenses</h3>
            <p className="stat-card-value">{(parseFloat(totals.totalUSD) || 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
        </div>
        <div className="stat-card">
            <h3>Total IQD Expenses</h3>
            <p className="stat-card-value">{(parseFloat(totals.totalIQD) || 0).toLocaleString()} IQD</p>
        </div>
      </div>

      {/* Add New Expense Form using Modal styling */}
      <div className="modal-content" style={{maxWidth: 'none', marginBottom: '2em'}}>
        <header className="modal-header"><h2>Record New Expense</h2></header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid" style={{gridTemplateColumns: '2fr 1fr 1fr 1fr'}}>
              <div className="input-group"><label>Description</label><input name="description" value={formData.description} onChange={handleChange} required /></div>
              <div className="input-group"><label>Amount</label><input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required /></div>
              <div className="input-group"><label>Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} required>
                  <option value="USD">USD</option>
                  <option value="IQD">IQD</option>
                </select>
              </div>
              <div className="input-group"><label>Date</label><input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} required /></div>
              <div className="input-group"><label>Vendor (Optional)</label><input name="vendor" value={formData.vendor} onChange={handleChange} /></div>
              <div className="input-group"><label>Expense Category</label>
                <select name="expense_account_id" value={formData.expense_account_id} onChange={handleChange} required>
                  <option value={0} disabled>Select a category...</option>
                  {expenseAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.account_name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes (Optional)</label><textarea name="notes" value={formData.notes} onChange={handleChange}></textarea></div>
            </div>
          </div>
          <footer className="modal-footer" style={{justifyContent: 'flex-end'}}>
              <button type="submit" className="button-primary">Save Expense</button>
          </footer>
        </form>
      </div>

      {/* List of Past Expenses */}
      <div className="client-list-container">
        <header className="client-list-header">
          <span>Date</span>
          <span>Description</span>
          <span>Category</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </header>
        {isLoading ? <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
         : expenses.map(expense => (
            <div className="client-row" key={expense.id}>
              <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
              <span>{expense.description}</span>
              <span>{expense.expense_category}</span>
              <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(expense.amount).toLocaleString(undefined, {style: 'currency', currency: expense.currency})}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default ExpensesPage;