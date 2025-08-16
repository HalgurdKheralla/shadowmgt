// frontend/src/pages/OrdersSummaryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import the currency hook
import toast from 'react-hot-toast';

interface ClientStat {
  id: number;
  company_name: string;
  totalOrders: string;
  lastOrderDate: string | null;
}

function OrdersSummaryPage() {
  const { currency } = useCurrency(); // <-- Use the hook to get the current currency
  const [clientStats, setClientStats] = useState<ClientStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientStats = useCallback(() => {
    setIsLoading(true);
    // --- UPDATED API CALL with currency ---
    api.get(`/clients/summary/orders?currency=${currency}`)
      .then(data => {
        setClientStats(data);
      })
      .catch(err => toast.error('Could not fetch order summary.'))
      .finally(() => setIsLoading(false));
  }, [currency]); // <-- Add currency to dependency array

  useEffect(() => {
    fetchClientStats();
  }, [fetchClientStats]);

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Orders Overview</h1>
        <p>Select a company to view all of their orders.</p>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '3fr 1fr 1fr' }}>
          <span>Company Name</span>
          <span style={{ textAlign: 'center' }}>Total Orders</span>
          <span style={{ textAlign: 'right' }}>Last Order Date</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          clientStats.map(client => (
            <div className="client-row" key={client.id} style={{ gridTemplateColumns: '3fr 1fr 1fr' }}>
              <Link to={`/orders/${client.id}`}>{client.company_name}</Link>
              <span style={{ textAlign: 'center' }}>{client.totalOrders}</span>
              <span style={{ textAlign: 'right' }}>
                {client.lastOrderDate ? new Date(client.lastOrderDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrdersSummaryPage;