// frontend/src/components/KarwanchiOrderForm.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  clientId: string;
  onOrderCreated: () => void;
}
interface Code {
  id: number;
  code_value: string;
}

const FIXED_SEPARATION_COST_USD = 125;

const initialState = {
  order_date: new Date().toISOString().split('T')[0],
  finish_date: '',
  code_id: '',
  product_description: '',
  size: '',
  billing_branch: 'RS',
  notes: '',
  design_cost_usd: 0,
  separation_cost_usd: FIXED_SEPARATION_COST_USD,
  total_cost_usd: FIXED_SEPARATION_COST_USD,
  is_approved: false,
};

function KarwanchiOrderForm({ clientId, onOrderCreated }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [availableCodes, setAvailableCodes] = useState<Code[]>([]);

  const fetchAvailableCodes = () => {
    api.get(`/codes?client_type=Karwanchi&status=available`)
      .then(setAvailableCodes)
      .catch(err => toast.error("Could not fetch available codes."));
  };

  useEffect(() => {
    fetchAvailableCodes();
  }, []);

  useEffect(() => {
    const designCost = parseFloat(String(formData.design_cost_usd)) || 0;
    const separationCost = parseFloat(String(formData.separation_cost_usd)) || 0;
    const newTotal = designCost + separationCost;
    if (newTotal !== formData.total_cost_usd) {
      setFormData(prevData => ({ ...prevData, total_cost_usd: newTotal }));
    }
  }, [formData.design_cost_usd, formData.separation_cost_usd]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        const numValue = (name === 'code_id' || type === 'number') ? parseInt(value, 10) || 0 : value;
        setFormData({ ...formData, [name]: numValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.code_id) {
        return toast.error('Please select an available code.');
    }
    const KARWANCHI_EXCHANGE_RATE = 1400;
    const total_cost_iqd = (formData.total_cost_usd || 0) * KARWANCHI_EXCHANGE_RATE;
    const payload = { ...formData, total_cost_iqd };

    toast.promise(
      api.post(`/clients/${clientId}/orders`, payload),
      {
        loading: 'Creating order...',
        success: () => {
          onOrderCreated();
          setFormData(initialState);
          fetchAvailableCodes();
          return 'Order created successfully!';
        },
        error: (err) => (err as Error).message || 'Failed to create order.'
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="input-group"><label>Product</label><input name="product_description" value={formData.product_description} onChange={handleChange} required /></div>
        <div className="input-group"><label>Code</label>
          <select name="code_id" value={formData.code_id} onChange={handleChange} required>
              <option value="" disabled>Select a code...</option>
              {availableCodes.map(code => <option key={code.id} value={code.id}>{code.code_value}</option>)}
          </select>
        </div>
        <div className="input-group"><label>Size</label><input name="size" value={formData.size} onChange={handleChange} /></div>
        <div className="input-group"><label>Date</label><input type="date" name="order_date" value={formData.order_date} onChange={handleChange} required /></div>
        <div className="input-group"><label>Finish Date</label><input type="date" name="finish_date" value={formData.finish_date || ''} onChange={handleChange} /></div>
        <div className="input-group"><label>To Be Paid By</label><select name="billing_branch" value={formData.billing_branch} onChange={handleChange}><option value="RS">RS</option><option value="RB">RB</option></select></div>
        <div className="input-group"><label>Design Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd} onChange={handleChange} /></div>
        <div className="input-group"><label>Separation Cost ($)</label><input type="number" name="separation_cost_usd" value={formData.separation_cost_usd} readOnly /></div>
        <div className="input-group"><label>Total Cost ($)</label><input type="text" value={(formData.total_cost_usd || 0).toLocaleString('en-US', {style:'currency', currency:'USD'})} readOnly /></div>
        <div className="input-group checkbox-group"><label><input type="checkbox" name="is_approved" checked={formData.is_approved} onChange={handleChange} /> Approved</label></div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea></div>
      </div>
      <footer className="modal-footer">
          <button type="button" className="button-secondary" onClick={onOrderCreated}>Cancel</button>
          <button type="submit" className="button-primary">Add Karwanchi Order</button>
      </footer>
    </form>
  );
}

export default KarwanchiOrderForm;