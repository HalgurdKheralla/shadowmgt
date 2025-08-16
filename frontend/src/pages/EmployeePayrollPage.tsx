// frontend/src/pages/EmployeePayrollPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { FaPlus } from 'react-icons/fa';
import RecordPaymentModal from '../components/RecordPaymentModal';

// --- TYPE DEFINITIONS ---
interface Employee {
  id: number;
  full_name: string;
}
interface SalaryPayment {
  id: number;
  payment_date: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
}

function EmployeePayrollPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  
  // --- STATE MANAGEMENT ---
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = useCallback(() => {
    if (!employeeId) return;
    setIsLoading(true);
    
    // Fetch both the employee's details and their payment history
    Promise.all([
      api.get(`/employees/${employeeId}`),
      api.get(`/employees/${employeeId}/payments`)
    ]).then(([employeeData, paymentsData]) => {
      setEmployee(employeeData);
      setPayments(paymentsData);
    }).catch(err => {
      toast.error("Could not load payroll data for this employee.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER FUNCTIONS ---
  const handleSave = () => {
    fetchData(); // This will refresh the payment list after a new payment is saved
  };

  if (isLoading) return <div>Loading payroll information...</div>;
  if (!employee) return <div>Employee not found.</div>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Payroll for {employee.full_name}</h1>
        <p>View payment history and record new salary payments.</p>
      </div>

      <div className="action-bar">
        <div></div>
        <button className="add-new-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Record New Payment
        </button>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
          <span>Payment Date</span>
          <span style={{ textAlign: 'right' }}>Base Salary</span>
          <span style={{ textAlign: 'right' }}>Bonuses</span>
          <span style={{ textAlign: 'right' }}>Deductions</span>
          <span style={{ textAlign: 'right', fontWeight: 'bold' }}>Net Pay</span>
        </header>
        {payments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>No payment history found for this employee.</div>
        ) : (
          payments.map(payment => (
            <div className="client-row" key={payment.id} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
              <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
              <span style={{ textAlign: 'right' }}>{Number(payment.base_salary).toLocaleString('en-US', {style:'currency', currency:'USD'})}</span>
              <span style={{ textAlign: 'right' }}>{Number(payment.bonuses).toLocaleString('en-US', {style:'currency', currency:'USD'})}</span>
              <span style={{ textAlign: 'right' }}>{Number(payment.deductions).toLocaleString('en-US', {style:'currency', currency:'USD'})}</span>
              <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(payment.net_pay).toLocaleString('en-US', {style:'currency', currency:'USD'})}</span>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <RecordPaymentModal
          employeeId={employeeId!}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default EmployeePayrollPage;