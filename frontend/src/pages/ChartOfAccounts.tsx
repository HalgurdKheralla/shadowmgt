// frontend/src/pages/ChartOfAccounts.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Account {
  id: number;
  account_code: number;
  account_name: string;
  account_type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  description: string | null;
}

function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/accounting/accounts')
      .then(data => {
        setAccounts(data);
      })
      .catch(err => toast.error('Could not fetch chart of accounts.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Chart of Accounts</h1>
        <p>A list of all financial accounts for your business.</p>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
          <span>Code</span>
          <span>Account Name</span>
          <span>Type</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          accounts.map(account => (
            <div className="client-row" key={account.id} style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
              <span>{account.account_code}</span>
              <span>{account.account_name}</span>
              <span>{account.account_type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChartOfAccounts;