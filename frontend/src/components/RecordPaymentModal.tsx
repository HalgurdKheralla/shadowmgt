// frontend/src/components/RecordPaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

interface Account {
  id: number;
  account_name: string;
}
interface Props {
  employeeId: string;
  onClose: () => void;
  onSave: () => void;
}
const initialState = {
  payment_date: new Date().toISOString().split('T')[0],
  pay_period_start: '',
  pay_period_end: '',
  base_salary: 0,
  bonuses: 0,
  deductions: 0,
  payment_account_id: 0,
};

function RecordPaymentModal({ employeeId, onClose, onSave }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);
  const [netPay, setNetPay] = useState(0);

  // Fetch asset accounts (like Cash) for the dropdown
  useEffect(() => {
    api.get('/accounting/accounts')
      .then(allAccounts => {
        setAssetAccounts(allAccounts.filter((acc: any) => acc.account_type === 'Asset'));
      })
      .catch(err => toast.error('Could not load payment accounts.'));
  }, []);
  
  // Calculate net pay automatically
  useEffect(() => {
    const base = parseFloat(String(formData.base_salary)) || 0;
    const bonus = parseFloat(String(formData.bonuses)) || 0;
    const deduction = parseFloat(String(formData.deductions)) || 0;
    setNetPay(base + bonus - deduction);
  }, [formData.base_salary, formData.bonuses, formData.deductions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.payment_account_id === 0) {
      return toast.error('Please select a "Paid From" account.');
    }
    const payload = { ...formData, net_pay: netPay };
    toast.promise(
      api.post(`/employees/${employeeId}/payments`, payload),
      {
        loading: 'Recording payment...',
        success: () => {
          onSave();
          onClose();
          return 'Salary payment recorded successfully!';
        },
        error: (err) => err.message || 'An error occurred.',
      }
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>Record Salary Payment</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group"><label>Payment Date</label><input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} required /></div>
              <div className="input-group"><label>Pay Period Start</label><input type="date" name="pay_period_start" value={formData.pay_period_start} onChange={handleChange} required /></div>
              <div className="input-group"><label>Pay Period End</label><input type="date" name="pay_period_end" value={formData.pay_period_end} onChange={handleChange} required /></div>
              <div className="input-group"><label>Base Salary</label><input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} required /></div>
              <div className="input-group"><label>Bonuses</label><input type="number" name="bonuses" value={formData.bonuses} onChange={handleChange} /></div>
              <div className="input-group"><label>Deductions</label><input type="number" name="deductions" value={formData.deductions} onChange={handleChange} /></div>
              <div className="input-group"><label>Paid From Account</label>
                <select name="payment_account_id" value={formData.payment_account_id} onChange={handleChange} required>
                  <option value={0} disabled>Select an account...</option>
                  {assetAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.account_name}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Net Pay (auto-calculated)</label><input type="text" value={netPay.toLocaleString(undefined, {style:'currency', currency:'USD'})} readOnly /></div>
            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button-primary">Record Payment</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
export default RecordPaymentModal;