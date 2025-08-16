// frontend/src/pages/Invoicing.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';

interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  total: number;
  currency: string;
  status: string;
}

function Invoicing() {
  const { currency } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchInvoices = useCallback(() => {
    setIsLoading(true);
    api.get(`/invoicing?currency=${currency}`)
      .then(data => {
        setInvoices(data);
      })
      .catch(err => {
        toast.error("Could not fetch invoices.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currency]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleGenerateInvoices = async () => {
    setIsLoading(true);
    toast.promise(
      api.post(`/invoicing/generate?currency=${currency}`, {}),
      {
        loading: 'Searching for orders and generating invoices...',
        success: (result: any) => {
          fetchInvoices(); // Refresh the list
          return result.message;
        },
        error: 'Failed to generate invoices.'
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  // --- NEW: Handler for changing the invoice status ---
  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    toast.promise(
        api.patch(`/invoicing/${invoiceId}/status`, { status: newStatus }),
        {
            loading: 'Updating status...',
            success: (updatedInvoice) => {
                // Update the status in our local list for an instant UI change
                setInvoices(prevInvoices => 
                    prevInvoices.map(inv => 
                        inv.id === invoiceId ? { ...inv, status: updatedInvoice.status } : inv
                    )
                );
                return `Invoice status updated to ${newStatus}`;
            },
            error: 'Failed to update status.'
        }
    );
  };


  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Invoicing</h1>
        <p>Generate new invoices from approved orders and view invoice history for the <span style={{fontWeight: 'bold'}}>{currency}</span> ledger.</p>
      </div>
      
      <div className="action-bar">
        <div></div>
        <button className="add-new-button" onClick={handleGenerateInvoices} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Generate Pending Invoices'}
        </button>
      </div>
      
      <div className="client-list-container">
        {/* --- UPDATED: Grid layout for better spacing --- */}
        <header className="client-list-header" style={{ gridTemplateColumns: '1fr 3fr 1fr 1.5fr 1.5fr' }}>
          <span>Invoice #</span>
          <span>Client</span>
          <span>Date</span>
          <span style={{ textAlign: 'right' }}>Total</span>
          <span style={{ textAlign: 'center' }}>Status</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading invoices...</div>
        ) : (
          invoices.map(invoice => (
            <div className="client-row" key={invoice.id} style={{ gridTemplateColumns: '1fr 3fr 1fr 1.5fr 1.5fr' }}>
              <Link to={`/invoicing/${invoice.id}`}>{invoice.invoice_number}</Link>
              <span>{invoice.client_name}</span>
              <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
              <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(invoice.total).toLocaleString(undefined, {style: 'currency', currency: invoice.currency})}</span>
              
              {/* --- UPDATED: Status is now a dropdown --- */}
              <div style={{textAlign: 'center'}}>
                <select 
                  value={invoice.status} 
                  onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Invoicing;