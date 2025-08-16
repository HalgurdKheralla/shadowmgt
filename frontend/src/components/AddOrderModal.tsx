// frontend/src/components/AddOrderModal.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import RoyalCanOrderForm from './RoyalCanOrderForm';
import KarwanchiOrderForm from './KarwanchiOrderForm';
import NormalOrderForm from './NormalOrderForm';
import ZainGroupOrderForm from './ZainGroupOrderForm'; // <-- Import the new form

interface Client {
  id: number;
  client_type: string;
}
interface Props {
  client: Client;
  onClose: () => void;
  onSave: () => void;
}

function AddOrderModal({ client, onClose, onSave }: Props) {
  const clientType = client.client_type.toLowerCase();

  const renderOrderForm = () => {
    if (clientType.includes('royal can')) {
      return <RoyalCanOrderForm clientId={String(client.id)} onOrderCreated={onSave} clientType={client.client_type} />;
    } else if (clientType.includes('karwanchi')) {
      return <KarwanchiOrderForm clientId={String(client.id)} onOrderCreated={onSave} />;
    } else if (clientType.includes('zain group')) { // <-- Add condition for Zain Group
      return <ZainGroupOrderForm clientId={String(client.id)} onOrderCreated={onSave} />;
    } else {
      return <NormalOrderForm clientId={String(client.id)} onOrderCreated={onSave} />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>Add New Order</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </header>
        <div className="modal-body">
          {renderOrderForm()}
        </div>
      </div>
    </div>
  );
}

export default AddOrderModal;