// frontend/src/components/NormalOrderForm.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Props {
  clientId: string;
  onOrderCreated: () => void;
}

// REMOVED 'code' from initial state
const initialState = {
  order_date: '',
  product_description: '',
  product_description_ar: '',
  cost_usd: 0,
  cost_iqd: 0,
  is_approved: false,
};

function NormalOrderForm({ clientId, onOrderCreated }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [exchangeRate, setExchangeRate] = useState(1450);

  useEffect(() => {
    api.get('/settings/NORMAL_CLIENT_EXCHANGE_RATE')
      .then(setting => {
        setExchangeRate(parseFloat(setting.setting_value));
      })
      .catch(err => console.error("Could not fetch exchange rate", err));
  }, []);

  useEffect(() => {
    const costUsd = parseFloat(String(formData.cost_usd)) || 0;
    const newIqdCost = costUsd * exchangeRate;
    setFormData(prev => ({ ...prev, cost_iqd: newIqdCost }));
  }, [formData.cost_usd, exchangeRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 'code' is no longer part of the payload we build
    const payload = {
      order_date: formData.order_date,
      product_description: formData.product_description,
      product_description_ar: formData.product_description_ar,
      is_approved: formData.is_approved,
      design_cost_usd: formData.cost_usd,
      total_cost_iqd: formData.cost_iqd,
    };

    try {
      await api.post(`/clients/${clientId}/orders`, payload);
      alert('Order created successfully!');
      setFormData(initialState);
      onOrderCreated();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1em', marginBottom: '2em' }}>
      <div className="form-grid">
        <div className="input-group"><label>Product Name (English)</label><input name="product_description" value={formData.product_description} onChange={handleChange} required /></div>
        <div className="input-group"><label>Product Name (Arabic)</label><input name="product_description_ar" value={formData.product_description_ar} onChange={handleChange} /></div>
        
        {/* --- REMOVED 'Code' INPUT FIELD --- */}
        
        <div className="input-group"><label>Date</label><input type="date" name="order_date" value={formData.order_date} onChange={handleChange} required /></div>
        <div className="input-group"><label>Cost ($)</label><input type="number" name="cost_usd" value={formData.cost_usd} onChange={handleChange} /></div>
        <div className="input-group"><label>Cost (IQD) (auto)</label><input type="text" value={formData.cost_iqd.toLocaleString()} readOnly /></div>
        <div className="input-group checkbox-group"><label><input type="checkbox" name="is_approved" checked={formData.is_approved} onChange={handleChange} /> Approved</label></div>
      </div>
      <footer className="modal-footer">
        <button type="submit">Add Order</button>
      </footer>
    </form>
  );
}

export default NormalOrderForm;