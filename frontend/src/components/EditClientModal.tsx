// frontend/src/components/EditClientModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  client_type: string; // <-- Add client_type
}

interface Props {
  client: Client;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
}

function EditClientModal({ client, onClose, onSave }: Props) {
  const [formData, setFormData] = useState(client);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // <-- Add HTMLSelectElement
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updatedClient = await api.put(`/clients/${client.id}`, formData);
      onSave(updatedClient);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save client');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Client: {client.company_name}</h2>
        <form onSubmit={handleSubmit}>
            <input name="company_name" value={formData.company_name} onChange={handleChange} required />
            <input name="contact_person" value={formData.contact_person} onChange={handleChange} />
            <input name="email" type="email" value={formData.email} onChange={handleChange} />
            <input name="phone" value={formData.phone} onChange={handleChange} />
            <input name="city" value={formData.city} onChange={handleChange} />
            
            {/* --- NEW DROPDOWN --- */}
            <div>
              <label>Client Type:</label>
              <select name="client_type" value={formData.client_type} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Karwanchi">Karwanchi</option>
                <option value="Royal Can RS">Royal Can RS</option>
                <option value="Royal Can RB">Royal Can RB</option>
              </select>
            </div>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default EditClientModal;