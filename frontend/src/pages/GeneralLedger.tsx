// frontend/src/pages/GeneralLedger.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface TransactionLine {
  id: number;
  account_name: string;
  debit: string | null;
  credit: string | null;
}

interface JournalEntry {
  id: number;
  entry_date: string;
  description: string;
  lines: TransactionLine[];
}

function GeneralLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/accounting/journal-entries')
      .then(data => {
        setEntries(data);
      })
      .catch(err => toast.error('Could not fetch journal entries.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>General Ledger</h1>
        <p>A record of all financial transactions.</p>
      </div>

      {isLoading ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className="ledger-entries-container">
          {entries.map(entry => (
            <div className="journal-entry-card" key={entry.id}>
              <div className="entry-header">
                <span>{new Date(entry.entry_date).toLocaleDateString()}</span>
                <span>{entry.description}</span>
              </div>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Debit</th>
                    <th style={{ textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map(line => (
                    <tr key={line.id}>
                      <td>{line.account_name}</td>
                      <td style={{ textAlign: 'right' }}>{line.debit ? parseFloat(line.debit).toLocaleString(undefined, {style:'currency', currency:'USD'}) : ''}</td>
                      <td style={{ textAlign: 'right' }}>{line.credit ? parseFloat(line.credit).toLocaleString(undefined, {style:'currency', currency:'USD'}) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GeneralLedger;