// frontend/src/components/ViewOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { api } from '../services/api';

// --- TYPE DEFINITIONS ---
interface Order {
  id: number;
  client_id: number;
  client_type: string;
  order_date: string;
  finish_date?: string | null;
  code: string;
  product_description: string;
  product_description_ar?: string;
  end_customer_name?: string;
  size?: string;
  billing_branch?: string;
  notes?: string;
  design_cost_usd?: number;
  separation_cost_usd?: number;
  separation_cost_iqd?: number;
  total_cost_usd?: number;
  total_cost_iqd?: number;
  is_approved?: boolean;
  printing_files_sent?: boolean;
}
interface HistoryLog {
  id: number;
  old_code: string;
  new_code: string;
  user_name: string;
  changed_at: string;
}
interface Props {
  order: Order;
  onClose: () => void;
}

const formatBoolean = (value?: boolean) => (value ? 'Yes' : 'No');

// --- HELPER COMPONENTS FOR EACH VIEW TYPE ---

const RoyalCanView = ({ order }: { order: Order }) => (
  <div className="view-modal-grid">
    <strong>Company:</strong> <span>{order.end_customer_name || 'N/A'}</span>
    <strong>Product:</strong> <span>{order.product_description}</span>
    <strong>Start Date:</strong> <span>{new Date(order.order_date).toLocaleDateString()}</span>
    <strong>Finish Date:</strong> <span>{order.finish_date ? new Date(order.finish_date).toLocaleDateString() : 'N/A'}</span>
    <strong>Size:</strong> <span>{order.size || 'N/A'}</span>
    <strong>Paid By Branch:</strong> <span>{order.billing_branch || 'N/A'}</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Design Cost:</strong> <span>{(order.design_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
    <strong>Separation Cost:</strong> <span>{(order.separation_cost_iqd || 0).toLocaleString()} IQD</span>
    <strong>Total Cost:</strong> <span style={{fontWeight: 'bold'}}>{(order.total_cost_iqd || 0).toLocaleString()} IQD</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Approved:</strong> <span>{formatBoolean(order.is_approved)}</span>
    <strong>Printing Files Sent:</strong> <span>{formatBoolean(order.printing_files_sent)}</span>
  </div>
);

const KarwanchiView = ({ order }: { order: Order }) => (
  <div className="view-modal-grid">
    <strong>Product:</strong> <span>{order.product_description}</span>
    <strong>Date:</strong> <span>{new Date(order.order_date).toLocaleDateString()}</span>
    <strong>Size:</strong> <span>{order.size || 'N/A'}</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Design Cost:</strong> <span>{(order.design_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
    <strong>Separation Cost:</strong> <span>{(order.separation_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
    <strong>Total Cost:</strong> <span style={{fontWeight: 'bold'}}>{(order.total_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Approved:</strong> <span>{formatBoolean(order.is_approved)}</span>
  </div>
);

// --- NEW: Helper component for Zain Group View ---
const ZainGroupView = ({ order }: { order: Order }) => (
    <div className="view-modal-grid">
        <strong>Product:</strong> <span>{order.product_description}</span>
        <strong>Date:</strong> <span>{new Date(order.order_date).toLocaleDateString()}</span>
        <strong>Size:</strong> <span>{order.size || 'N/A'}</span>
        <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)'}}/>
        <strong>Design Cost:</strong> <span>{(order.design_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        <strong>Separation Cost:</strong> <span>{(order.separation_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        <strong>Total Cost:</strong> <span style={{fontWeight: 'bold'}}>{(order.total_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        <hr style={{gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)'}}/>
        <strong>Approved:</strong> <span>{formatBoolean(order.is_approved)}</span>
    </div>
);

const NormalView = ({ order }: { order: Order }) => (
  <div className="view-modal-grid">
    <strong>Product (English):</strong> <span>{order.product_description}</span>
    <strong>Product (Arabic):</strong> <span>{order.product_description_ar || 'N/A'}</span>
    <strong>Date:</strong> <span>{new Date(order.order_date).toLocaleDateString()}</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Cost (USD):</strong> <span style={{fontWeight: 'bold'}}>{(order.design_cost_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
    <strong>Cost (IQD):</strong> <span style={{fontWeight: 'bold'}}>{(order.total_cost_iqd || 0).toLocaleString()} IQD</span>
    <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--card-border-color)' }}/>
    <strong>Approved:</strong> <span>{formatBoolean(order.is_approved)}</span>
  </div>
);

// --- MAIN MODAL COMPONENT ---
function ViewOrderModal({ order, onClose }: Props) {
  const [history, setHistory] = useState<HistoryLog[]>([]);
  useEffect(() => {
    if (order && order.id && order.client_id) {
      api.get(`/clients/${order.client_id}/orders/${order.id}/history`).then(setHistory);
    }
  }, [order]);
  

  const renderOrderDetails = () => {
    const clientType = order.client_type.toLowerCase();
    if (clientType.includes('royal can')) return <RoyalCanView order={order} />;
    if (clientType.includes('karwanchi')) return <KarwanchiView order={order} />;
        if (clientType.includes('zain group')) return <ZainGroupView order={order} />; // <-- ADDED

    return <NormalView order={order} />;
  };

  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>Order Details: {order.code}</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </header>
        <div className="modal-body">
          {renderOrderDetails()}

          {history.length > 0 && (
            <>
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--card-border-color)' }} />
              <h4>Code Change History</h4>
              {history.map(log => (
                <div key={log.id} style={{ fontSize: '12px', marginBottom: '8px', padding: '8px', background: 'var(--sidebar-bg)', borderRadius: '4px' }}>
                  <p style={{margin: 0}}>
                    Code changed from <strong>{log.old_code}</strong> to <strong>{log.new_code}</strong>
                  </p>
                  <p style={{margin: '4px 0 0', fontSize: '10px', color: 'var(--sidebar-text-color)'}}>
                    by {log.user_name} on {new Date(log.changed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </>
          )}
           <div style={{marginTop: '20px'}}>
             <strong>Notes:</strong>
             <p style={{margin: '4px 0 0', whiteSpace: 'pre-wrap', color: 'var(--sidebar-text-color)'}}>{order.notes || 'No notes.'}</p>
           </div>
        </div>
        <footer className="modal-footer">
            <button type="button" className="button-secondary" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}

export default ViewOrderModal;