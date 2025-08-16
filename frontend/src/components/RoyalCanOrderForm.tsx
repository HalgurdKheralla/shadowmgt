// frontend/src/components/RoyalCanOrderForm.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  clientId: string;
  clientType: string;
  onOrderCreated: () => void;
}

interface Code {
  id: number;
  code_value: string;
}

const EXCHANGE_RATE_USD_TO_IQD = 1500;
const FIXED_SEPARATION_COST_IQD = 190000;

const getInitialState = (clientType: string) => {
  const branch = clientType.includes('RB') ? 'RB' : 'RS';
  return {
    order_date: new Date().toISOString().split('T')[0],
    finish_date: '',
    code_id: '', // We now use code_id to link to the master codes table
    product_description: '',
    end_customer_name: '',
    size: '',
    billing_branch: branch,
    notes: '',
    design_cost_usd: 0,
    separation_cost_iqd: FIXED_SEPARATION_COST_IQD,
    total_cost_iqd: FIXED_SEPARATION_COST_IQD,
    is_approved: false,
    printing_files_sent: false,
  };
};

function RoyalCanOrderForm({ clientId, clientType, onOrderCreated }: Props) {
  const [formData, setFormData] = useState(getInitialState(clientType));
  const [availableCodes, setAvailableCodes] = useState<Code[]>([]);

  const fetchAvailableCodes = () => {
    api.get(`/codes?client_type=Royal Can&status=available`)
      .then(setAvailableCodes)
      .catch(err => toast.error("Could not fetch available codes."));
  };

  useEffect(() => {
    fetchAvailableCodes();
  }, [clientType]);

  useEffect(() => {
    const designCost = parseFloat(String(formData.design_cost_usd)) || 0;
    const separationCost = parseFloat(String(formData.separation_cost_iqd)) || 0;
    const designCostInIqd = designCost * EXCHANGE_RATE_USD_TO_IQD;
    const newTotal = designCostInIqd + separationCost;
    if (newTotal !== formData.total_cost_iqd) {
      setFormData(prevData => ({ ...prevData, total_cost_iqd: newTotal }));
    }
  }, [formData.design_cost_usd, formData.separation_cost_iqd]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        const numValue = (type === 'number' || name === 'code_id') ? parseInt(value, 10) || 0 : value;
        setFormData({ ...formData, [name]: numValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.code_id) {
        return toast.error('Please select an available code.');
    }
    toast.promise(
      api.post(`/clients/${clientId}/orders`, formData),
      {
        loading: 'Creating order...',
        success: () => {
          onOrderCreated();
          setFormData(getInitialState(clientType));
          fetchAvailableCodes(); // Refetch codes as one has been used
          return 'Order created successfully!';
        },
        error: (err) => (err as Error).message || 'Failed to create order.'
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="input-group"><label>Company</label><input name="end_customer_name" value={formData.end_customer_name} onChange={handleChange} /></div>
          <div className="input-group"><label>Product</label><input name="product_description" value={formData.product_description} onChange={handleChange} required /></div>
          <div className="input-group"><label>Code</label>
              <select name="code_id" value={formData.code_id} onChange={handleChange} required>
                  <option value="" disabled>Select a code...</option>
                  {availableCodes.map(code => <option key={code.id} value={code.id}>{code.code_value}</option>)}
              </select>
          </div>
          <div className="input-group"><label>Start Date</label><input type="date" name="order_date" value={formData.order_date} onChange={handleChange} required /></div>
          <div className="input-group"><label>Finish Date</label><input type="date" name="finish_date" value={formData.finish_date || ''} onChange={handleChange} /></div>
          <div className="input-group"><label>Size</label><input name="size" value={formData.size} onChange={handleChange} /></div>
          <div className="input-group"><label>Design Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd} onChange={handleChange} /></div>
          <div className="input-group"><label>Separation Cost (IQD)</label><input type="number" name="separation_cost_iqd" value={formData.separation_cost_iqd} readOnly /></div>
          <div className="input-group"><label>Total Cost (IQD)</label><input type="text" value={formData.total_cost_iqd.toLocaleString()} readOnly /></div>
          <div className="input-group"><label>To Be Paid By</label><select name="billing_branch" value={formData.billing_branch} disabled><option value="RS">RS</option><option value="RB">RB</option></select></div>
          <div className="input-group checkbox-group" style={{alignItems: 'center'}}><label><input type="checkbox" name="printing_files_sent" checked={formData.printing_files_sent} onChange={handleChange} /> Printing Files Sent</label></div>
          <div className="input-group checkbox-group" style={{alignItems: 'center'}}><label><input type="checkbox" name="is_approved" checked={formData.is_approved} onChange={handleChange} /> Approved</label></div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea></div>
        </div>
        <footer className="modal-footer">
            <button type="button" className="button-secondary" onClick={onOrderCreated}>Cancel</button>
            <button type="submit" className="button-primary">Add Royal Can Order</button>
        </footer>
    </form>
  );
}

export default RoyalCanOrderForm;