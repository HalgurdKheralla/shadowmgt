// frontend/src/pages/Clients.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import the currency hook
import { FaPlus, FaSearch } from 'react-icons/fa';
import ActionsMenu from '../components/ActionsMenu';
import AddEditClientModal from '../components/AddEditClientModal';
import ViewClientModal from '../components/ViewClientModal';
import AddOrderModal from '../components/AddOrderModal';

// Interface for Client data
interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  client_type: string;
  totalDeals: string;
}

function Clients() {
  const { currency } = useCurrency(); // <-- Use the hook to get the current currency
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // State for controlling all three modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchClients = useCallback(() => {
    setIsLoading(true);
    // --- UPDATED API CALL with currency ---
    api.get(`/clients?search=${searchTerm}&currency=${currency}`)
      .then(data => setClients(data))
      .catch(err => toast.error('Could not fetch clients.'))
      .finally(() => setIsLoading(false));
  }, [searchTerm, currency]); // <-- Add currency to dependency array

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchClients]);

  // --- HANDLER FUNCTIONS for the menu ---
  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setSelectedClient(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsAddEditModalOpen(true);
  };

  const handleOpenAddOrderModal = (client: Client) => {
    setSelectedClient(client);
    setIsAddOrderModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsAddEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsAddOrderModalOpen(false);
    setSelectedClient(null);
  };
  
  const handleSave = () => {
    fetchClients(); // Refetch clients after any save
  };

  const handleDelete = (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      api.del(`/clients/${clientId}`)
        .then(() => {
          toast.success('Client deleted.');
          fetchClients();
        })
        .catch(err => toast.error((err as Error).message || 'Failed to delete client.'));
    }
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Companies</h1>
        <p>Manage your companies</p>
      </div>

      <div className="action-bar">
        <div></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="search-bar">
            <span className="search-icon"><FaSearch /></span>
            <input 
              type="text" 
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-new-button" onClick={handleOpenAddModal}>
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      <div className="client-list-container">
        <header className="client-list-header">
          <input type="checkbox" />
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Total Deals</span>
          <span style={{textAlign: 'center'}}>Actions</span>
        </header>
        {isLoading ? <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
         : clients.map(client => (
            <div className="client-row" key={client.id}>
              <input type="checkbox" />
              <span>{client.company_name}</span>
              <span>{client.email}</span>
              <span>{client.phone}</span>
              <span>{client.totalDeals}</span>
              <ActionsMenu
                onView={() => handleView(client)}
                onEdit={() => handleOpenEditModal(client)}
                onAddOrder={() => handleOpenAddOrderModal(client)}
                onDelete={() => handleDelete(client.id)}
              />
            </div>
          ))
        }
      </div>

      {isAddEditModalOpen && <AddEditClientModal clientToEdit={selectedClient} onClose={handleCloseModals} onSave={handleSave} />}
      {isViewModalOpen && selectedClient && <ViewClientModal client={selectedClient} onClose={handleCloseModals} />}
      {isAddOrderModalOpen && selectedClient && <AddOrderModal client={selectedClient} onClose={handleCloseModals} onSave={handleSave} />}
    </div>
  );
}

export default Clients;