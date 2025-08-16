// frontend/src/components/ViewClientModal.tsx
import React from 'react';
import { LuX } from 'react-icons/lu';

// Using a simplified Client interface for display
interface Client {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  totalDeals: string;
}

interface Props {
  client: Client;
  onClose: () => void;
}

function ViewClientModal({ client, onClose }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{client.company_name}</h2>
          <button onClick={onClose} className="close-button"><LuX /></button>
        </header>
        <div className="modal-body">
            {/* The className is now correctly applied here */}
            <div className="view-modal-grid">
                <strong>Contact Person:</strong> <span>{client.contact_person || 'N/A'}</span>
                <strong>Email:</strong> <span>{client.email || 'N/A'}</span>
                <strong>Phone:</strong> <span>{client.phone || 'N/A'}</span>
                <strong>City:</strong> <span>{client.city || 'N/A'}</span>
                <strong>Total Deals:</strong> <span>{client.totalDeals || '0'}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
export default ViewClientModal;