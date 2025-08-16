// frontend/src/pages/ClientOrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ActionsMenu from '../components/ActionsMenu';
import AddOrderModal from '../components/AddOrderModal';
import EditOrderModal from '../components/EditOrderModal';
import ViewOrderModal from '../components/ViewOrderModal';

// --- TYPE DEFINITIONS ---
interface Client {
  id: number;
  company_name: string;
  client_type: string;
}
// In frontend/src/pages/ClientOrdersPage.tsx
interface Order {
  id: number;
  client_id: number;
  order_date: string;
  code: string;
  product_description: string;
  is_approved: boolean;
  client_type: string; // <-- Ensure this field is here
  [key: string]: any;
}

function ClientOrdersPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  // --- STATE MANAGEMENT ---
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for controlling all modals
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- DATA FETCHING ---
  const fetchData = useCallback(() => {
    if (!clientId) return;
    setIsLoading(true);
    
    // Fetch both the client's details and their filtered orders
    const clientPromise = client ? Promise.resolve(client) : api.get(`/clients/${clientId}`);
    const ordersPromise = api.get(`/clients/${clientId}/orders?search=${searchTerm}`);
    
    Promise.all([clientPromise, ordersPromise])
      .then(([clientData, ordersData]) => {
        if (!client) setClient(clientData); // Only set client once
        setOrders(ordersData);
      })
      .catch(err => toast.error("Could not load client's orders."))
      .finally(() => setIsLoading(false));
  }, [clientId, searchTerm, client]);

  useEffect(() => {
    // Debounce effect to prevent API calls on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchData]);


  // --- HANDLER FUNCTIONS ---
  const handleOpenViewModal = (order: Order) => { setSelectedOrder(order); setIsViewModalOpen(true); };
  const handleOpenEditModal = (order: Order) => { setSelectedOrder(order); setIsEditModalOpen(true); };
  const handleCloseModals = () => {
    setIsAddOrderModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSave = () => { fetchData(); }; // Refetch data after any save action

  const handleDelete = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      api.del(`/clients/${clientId}/orders/${orderId}`)
        .then(() => {
          toast.success('Order deleted.');
          fetchData();
        })
        .catch(err => toast.error('Failed to delete order.'));
    }
  };
  
  const handleStatusChange = async (order: Order) => {
    const newStatus = !order.is_approved;
    toast.promise(
      api.patch(`/clients/${clientId}/orders/${order.id}/status`, { is_approved: newStatus }),
      {
        loading: 'Updating status...',
        success: `Order status updated to ${newStatus ? 'Approved' : 'Not Approved'}.`,
        error: 'Failed to update status.'
      }
    ).then(() => fetchData());
  };

  if (isLoading && !client) return <div>Loading orders...</div>;
  if (!client) return <div>Client not found.</div>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Orders for {client.company_name}</h1>
      </div>
      
      <div className="action-bar">
        <div className="search-bar">
            <span className="search-icon"><FaSearch /></span>
            <input 
              type="text" 
              placeholder="Search by Code or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="add-new-button" onClick={() => setIsAddOrderModalOpen(true)}>
          <FaPlus /> Add New Order
        </button>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr 50px' }}>
          <span>Date</span>
          <span>Order Code</span>
          <span>Product</span>
          <span>Approved</span>
          <span>Actions</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          orders.map(order => (
            <div className="client-row" key={order.id} style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr 50px' }}>
              <span>{new Date(order.order_date).toLocaleDateString()}</span>
              <span>{order.code}</span>
              <span>{order.product_description}</span>
              <span>{order.is_approved ? 'Yes' : 'No'}</span>
              <ActionsMenu
                onView={() => handleOpenViewModal(order)}
                onEdit={() => handleOpenEditModal(order)}
                onChangeStatus={() => handleStatusChange(order)}
                onDelete={() => handleDelete(order.id)}
              />
            </div>
          ))
        )}
      </div>

      {isAddOrderModalOpen && <AddOrderModal client={client} onClose={handleCloseModals} onSave={handleSave} />}
      {isViewModalOpen && selectedOrder && <ViewOrderModal order={selectedOrder} onClose={handleCloseModals} />}
      {isEditModalOpen && selectedOrder && <EditOrderModal order={selectedOrder} clientId={clientId!} onClose={handleCloseModals} onSave={handleSave} />}
    </div>
  );
}

export default ClientOrdersPage;