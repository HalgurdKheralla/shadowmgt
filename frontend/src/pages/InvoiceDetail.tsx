// frontend/src/pages/InvoiceDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// ... (Interface definitions are unchanged)
interface InvoiceItem { id: number; description: string; line_total: number; }
interface InvoiceDetails { id: number; invoice_number: string; client_name: string; invoice_date: string; due_date: string | null; status: string; subtotal: number; discount: number; total: number; currency: string; notes: string | null; items: InvoiceItem[]; }

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!id) return;
    api.get(`/invoicing/${id}`)
      .then(data => { setInvoice(data); })
      .catch(err => {
        console.error("Failed to fetch invoice details:", err);
        toast.error('Could not load invoice details.');
      })
      .finally(() => { setIsLoading(false); });
  }, [id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!invoice) return;
    try {
      const updatedInvoice = await api.patch(`/invoicing/${invoice.id}/status`, { status: newStatus });
      setInvoice(updatedInvoice);
      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  if (isLoading) { return <div>Loading invoice...</div>; }
  if (!invoice) { return <div>Invoice not found.</div>; }

  return (
    <div style={{ padding: '2em', border: '1px solid #ccc', backgroundColor: 'var(--card-bg)', color: 'var(--main-text-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Invoice #{invoice.invoice_number}</h2>
          <p><strong>Billed To:</strong> {invoice.client_name}</p>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="status-select"><strong>Status:</strong></label>
            <select id="status-select" value={invoice.status} onChange={handleStatusChange}>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <hr style={{ margin: '2em 0' }} />

      <h4>Line Items</h4>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--main-text-color)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f2f5' }}>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>Line Total</th>
          </tr>
        </thead>
        {/* --- THIS IS THE MISSING TABLE BODY --- */}
        <tbody>
  {invoice && invoice.items && invoice.items.map(item => (
    <tr key={item.id}>
      <td>{item.description}</td>
      <td style={{ textAlign: 'right' }}>{parseFloat(String(item.line_total)).toLocaleString()} {invoice.currency}</td>
    </tr>
  ))}
</tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
        <div style={{ width: '250px', textAlign: 'right' }}>
          <p><strong>Subtotal:</strong> {parseFloat(String(invoice.subtotal)).toLocaleString()} {invoice.currency}</p>
          <p><strong>Discount:</strong> {parseFloat(String(invoice.discount)).toLocaleString()} {invoice.currency}</p>
          <h3 style={{ borderTop: '2px solid #333', paddingTop: '8px' }}>
            <strong>Total:</strong> {parseFloat(String(invoice.total)).toLocaleString()} {invoice.currency}
          </h3>
        </div>
      </div>
      
      {invoice.notes && <p style={{marginTop: '2em'}}><strong>Notes:</strong> {invoice.notes}</p>}

      <div style={{marginTop: '2em', textAlign: 'center'}}>
        <a href={`http://localhost:5000/api/invoicing/${invoice.id}/download?token=${token}`} target="_blank" rel="noopener noreferrer">
          <button disabled={!token}>Download as PDF</button>
        </a>
      </div>
    </div>
  );
}

export default InvoiceDetail;