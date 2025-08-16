// frontend/src/pages/ClientDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// We only need the modals that are actually used on this page
import EditOrderModal from '../components/EditOrderModal';
import ViewOrderModal from '../components/ViewOrderModal';

// --- TYPE DEFINITIONS ---
interface Client { 
  id: number; 
  company_name: string; 
  contact_person: string; 
  email: string; 
  client_type: string; 
}

interface Order {
  id: number;
  client_id: number;
  order_date: string;
  finish_date?: string | null;
  code: string;
  product_description: string;
  end_customer_name?: string;
  size?: string;
  billing_branch?: string;
  notes?: string;
  design_cost_usd?: number;
  separation_cost_iqd?: number;
  total_cost_iqd?: number;
  is_approved?: boolean;
  printing_files_sent?: boolean;
}

// --- MAIN PAGE COMPONENT ---
function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(() => {
    if (!id) return;
    Promise.all([
      api.get(`/clients/${id}`),
      api.get(`/clients/${id}/orders`)
    ]).then(([clientData, ordersData]) => {
      setClient(clientData);
      setOrders(ordersData);
    }).catch(err => toast.error("Could not load client's data."));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenViewModal = (order: Order) => { setSelectedOrder(order); setIsViewModalOpen(true); };
  const handleOpenEditModal = (order: Order) => { setSelectedOrder(order); setIsEditModalOpen(true); };
  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };
  const handleSaveOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  if (!client) return <div>Loading client details...</div>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>{client.company_name}</h1>
        <p>Contact: {client.contact_person} ({client.email})</p>
      </div>
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--card-border-color)' }} />
      
      {/* The "Add New Order" form section has been completely removed */}

      <h3 style={{marginTop: '40px'}}>Orders</h3>
      <div className="client-list-container">
        <header className="client-list-header">
            <span>Date</span>
            <span>Order Code</span>
            <span>Product</span>
            <span>Approved</span>
            <span>Actions</span>
        </header>
        {orders.map(order => (
          <div className="client-row" key={order.id}>
            <span>{new Date(order.order_date).toLocaleDateString()}</span>
            <span>{order.code}</span>
            <span>{order.product_description}</span>
            <span>{order.is_approved ? 'Yes' : 'No'}</span>
            <div>
                <button onClick={() => handleOpenViewModal(order)}>View</button>
                <button onClick={() => handleOpenEditModal(order)}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {isViewModalOpen && selectedOrder && <ViewOrderModal order={selectedOrder} onClose={handleCloseModals} />}
      {isEditModalOpen && <EditOrderModal order={selectedOrder} clientId={id!} onClose={handleCloseModals} onSave={handleSaveOrder} />}
    </div>
  );
}

export default ClientDetail;