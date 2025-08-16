// frontend/src/pages/ClientDebtReportPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import the currency hook
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';

interface ClientDebt {
  clientId: number;
  company_name: string;
  totalDebt: number;
}

function ClientDebtReportPage() {
  const { currency } = useCurrency(); // <-- Use the hook to get the current currency
  const [debts, setDebts] = useState<ClientDebt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDebts = useCallback(() => {
    setIsLoading(true);
    // --- UPDATED API CALL with currency ---
    api.get(`/reports/client-debts?search=${searchTerm}&currency=${currency}`)
      .then(data => {
        setDebts(data);
      })
      .catch(err => toast.error('Could not fetch client debt report.'))
      .finally(() => setIsLoading(false));
  }, [searchTerm, currency]); // <-- Add currency to dependency array

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchDebts();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, fetchDebts]);

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Client Debt Report</h1>
        <p>A summary of all outstanding client balances for the <span style={{fontWeight: 'bold'}}>{currency}</span> ledger.</p>
      </div>

      <div className="action-bar">
        <div></div>
        <div className="search-bar">
          <span className="search-icon"><FaSearch /></span>
          <input 
            type="text" 
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '3fr 1fr' }}>
          <span>Company Name</span>
          <span style={{ textAlign: 'right' }}>Outstanding Balance</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
            debts.length === 0 
            ? <div style={{ padding: '24px', textAlign: 'center' }}>No outstanding client debts found.</div>
            : debts.map(debt => (
                <div className="client-row" key={debt.clientId} style={{ gridTemplateColumns: '3fr 1fr' }}>
                  <Link to={`/clients/${debt.clientId}`}>{debt.company_name}</Link>
                  <span style={{ textAlign: 'right', fontWeight: 'bold', color: debt.totalDebt > 0 ? '#ef4444' : 'inherit' }}>
                    {debt.totalDebt.toLocaleString('en-US', {style:'currency', currency:'USD'})}
                  </span>
                </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientDebtReportPage;