// frontend/src/components/AddEditClientModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

interface Client {
  id?: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  client_type: string;
}

interface Props {
  clientToEdit: Partial<Client> | null;
  onClose: () => void;
  onSave: () => void;
}

const initialState: Client = {
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    city: '',
    client_type: 'Normal',
};

function AddEditClientModal({ clientToEdit, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Client>>(initialState);
  const isEditMode = clientToEdit && clientToEdit.id;

  useEffect(() => {
    if (isEditMode) {
      setFormData(clientToEdit);
    } else {
      setFormData(initialState);
    }
  }, [clientToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const promise = isEditMode
      ? api.put(`/clients/${clientToEdit!.id}`, formData)
      : api.post('/clients', formData);

    toast.promise(promise, {
      loading: 'Saving client...',
      success: () => {
        onSave();
        onClose();
        return `Client ${isEditMode ? 'updated' : 'created'} successfully!`;
      },
      error: (err) => (err as Error).message || 'An error occurred.',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{isEditMode ? 'Edit company' : 'Add company'}</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group"><label htmlFor="company_name">Company name</label><input id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleChange} required /></div>
              <div className="input-group"><label htmlFor="contact_person">Key contact</label><input id="contact_person" name="contact_person" value={formData.contact_person || ''} onChange={handleChange} /></div>
              <div className="input-group"><label htmlFor="email">Email</label><input id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} /></div>
              <div className="input-group"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
              <div className="input-group"><label htmlFor="city">City</label><input id="city" name="city" value={formData.city || ''} onChange={handleChange} /></div>
              
              <div className="input-group">
                <label htmlFor="client_type">Client Type</label>
                <select id="client_type" name="client_type" value={formData.client_type || 'Normal'} onChange={handleChange}>
                  <option value="Normal">Normal</option>
                  <option value="Karwanchi">Karwanchi</option>
                  <option value="Royal Can RS">Royal Can RS</option>
                  <option value="Royal Can RB">Royal Can RB</option>
                  {/* --- THIS IS THE NEWLY ADDED OPTION --- */}
                  <option value="Zain Group">Zain Group</option>
                </select>
              </div>

            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button-primary">{isEditMode ? 'Save changes' : 'Create company'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default AddEditClientModal;