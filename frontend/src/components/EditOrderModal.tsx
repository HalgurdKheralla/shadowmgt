// frontend/src/components/EditOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

// --- TYPE DEFINITIONS ---
interface Order {
  id: number;
  client_id: number;
  client_type: string;
  order_date: string;
  finish_date?: string | null;
  code: string;
  code_id?: number | null;
  product_description: string;
  product_description_ar?: string;
  end_customer_name?: string;
  size?: string;
  billing_branch?: string;
  notes?: string;
  design_cost_usd?: number;
  separation_cost_usd?: number;
  separation_cost_iqd?: number;
  total_cost_usd?: number;
  total_cost_iqd?: number;
  is_approved?: boolean;
  printing_files_sent?: boolean;
}
interface Code { id: number; code_value: string; }
interface Props { order: Order | null; clientId: string; onClose: () => void; onSave: (updatedOrder: Order) => void; }

// --- CONSTANTS ---
const EXCHANGE_RATE_USD_TO_IQD = 1500;
const KARWANCHI_EXCHANGE_RATE = 1400;
const FIXED_SEPARATION_COST_USD = 125;
const FIXED_SEPARATION_COST_IQD = 190000;

function EditOrderModal({ order, clientId, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Order>>(order || {});
  const [availableCodes, setAvailableCodes] = useState<Code[]>([]);
  const [globalExchangeRate, setGlobalExchangeRate] = useState(1450);

  useEffect(() => {
    if (order) {
      const clientType = order.client_type.toLowerCase();
      setFormData({
        ...order,
        order_date: new Date(order.order_date).toISOString().split('T')[0],
        finish_date: order.finish_date ? new Date(order.finish_date).toISOString().split('T')[0] : '',
      });

      // --- UPDATED: Now fetches codes for Zain Group as well ---
      if (clientType.includes('royal can') || clientType.includes('karwanchi') || clientType.includes('zain group')) {
        let typeForAPI = 'Normal';
        if(clientType.includes('royal can')) typeForAPI = 'Royal Can';
        if(clientType.includes('karwanchi')) typeForAPI = 'Karwanchi';
        if(clientType.includes('zain group')) typeForAPI = 'Zain Group';
        
        api.get(`/codes?client_type=${encodeURIComponent(typeForAPI)}&status=available`)
          .then(codes => {
            const currentCodeInList = codes.find((c: Code) => c.id === order.code_id);
            if (!currentCodeInList && order.code_id) {
              setAvailableCodes([{ id: order.code_id, code_value: order.code }, ...codes]);
            } else {
              setAvailableCodes(codes);
            }
          });
      }
      
      if (clientType.includes('normal')) {
        api.get('/settings/NORMAL_CLIENT_EXCHANGE_RATE').then(setting => setGlobalExchangeRate(parseFloat(setting.setting_value)));
      }
    }
  }, [order]);
  
  // --- DYNAMIC CALCULATIONS ---
  useEffect(() => {
    const clientType = formData.client_type?.toLowerCase() || '';
    let newTotalIqd: number | undefined = formData.total_cost_iqd;
    let newTotalUsd: number | undefined = formData.total_cost_usd;

    if (clientType.includes('royal can')) {
        const designCost = parseFloat(String(formData.design_cost_usd || 0));
        newTotalIqd = (designCost * EXCHANGE_RATE_USD_TO_IQD) + FIXED_SEPARATION_COST_IQD;
    } else if (clientType.includes('karwanchi')) {
        const designCost = parseFloat(String(formData.design_cost_usd || 0));
        newTotalUsd = designCost + FIXED_SEPARATION_COST_USD;
    } else { // Normal
        const designCost = parseFloat(String(formData.design_cost_usd || 0));
        newTotalUsd = designCost;
        newTotalIqd = designCost * globalExchangeRate;
    }
    
    setFormData(prev => ({ ...prev, total_cost_iqd: newTotalIqd, total_cost_usd: newTotalUsd }));
  }, [formData.design_cost_usd, globalExchangeRate]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number' || name ==='code_id';
    
    setFormData(prev => ({
        ...prev,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) return;
    toast.promise(
      api.put(`/clients/${clientId}/orders/${order.id}`, formData),
      {
        loading: 'Saving changes...',
        success: (updatedOrder) => {
          onSave(updatedOrder);
          onClose();
          return 'Order updated successfully!';
        },
        error: (err) => (err as Error).message || 'Failed to save order.'
      }
    );
  };
  
  if (!order) return null;

  // --- DYNAMIC FORM RENDERER ---
  const renderEditForm = () => {
    const clientType = order.client_type.toLowerCase();

    if (clientType.includes('royal can')) {
      return (
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="input-group"><label>Company</label><input name="end_customer_name" value={formData.end_customer_name || ''} onChange={handleChange} /></div>
            <div className="input-group"><label>Product</label><input name="product_description" value={formData.product_description || ''} onChange={handleChange} required /></div>
            <div className="input-group"><label>Code</label><select name="code_id" value={formData.code_id || ''} onChange={handleChange} required><option value="">Select a code...</option>{availableCodes.map(c => <option key={c.id} value={c.id}>{c.code_value}</option>)}</select></div>
            <div className="input-group"><label>Start Date</label><input type="date" name="order_date" value={formData.order_date || ''} onChange={handleChange} required /></div>
            <div className="input-group"><label>Finish Date</label><input type="date" name="finish_date" value={formData.finish_date || ''} onChange={handleChange} /></div>
            <div className="input-group"><label>Size</label><input name="size" value={formData.size || ''} onChange={handleChange} /></div>
            <div className="input-group"><label>Design Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd || 0} onChange={handleChange} /></div>
            <div className="input-group"><label>Separation Cost (IQD)</label><input type="number" name="separation_cost_iqd" value={formData.separation_cost_iqd || 0} readOnly /></div>
            <div className="input-group"><label>Total Cost (IQD)</label><input type="text" value={(formData.total_cost_iqd || 0).toLocaleString()} readOnly /></div>
            <div className="input-group"><label>To Be Paid By</label><select name="billing_branch" value={formData.billing_branch || 'RS'} onChange={handleChange} disabled><option value="RS">RS</option><option value="RB">RB</option></select></div>
            <div className="input-group checkbox-group" style={{alignItems: 'center'}}><label><input type="checkbox" name="printing_files_sent" checked={formData.printing_files_sent || false} onChange={handleChange} /> Printing Files Sent</label></div>
            <div className="input-group checkbox-group" style={{alignItems: 'center'}}><label><input type="checkbox" name="is_approved" checked={formData.is_approved || false} onChange={handleChange} /> Approved</label></div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3}></textarea></div>
        </div>
      );
    } 
    else if (clientType.includes('karwanchi')) {
      return (
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="input-group"><label>Product</label><input name="product_description" value={formData.product_description || ''} onChange={handleChange} required /></div>
          <div className="input-group"><label>Code</label><select name="code_id" value={formData.code_id || ''} onChange={handleChange} required><option value="">Select a code...</option>{availableCodes.map(c => <option key={c.id} value={c.id}>{c.code_value}</option>)}</select></div>
          <div className="input-group"><label>Size</label><input name="size" value={formData.size || ''} onChange={handleChange} /></div>
          <div className="input-group"><label>Date</label><input type="date" name="order_date" value={formData.order_date || ''} onChange={handleChange} required /></div>
          <div className="input-group"><label>Finish Date</label><input type="date" name="finish_date" value={formData.finish_date || ''} onChange={handleChange} /></div>
          <div className="input-group"><label>To Be Paid By</label><select name="billing_branch" value={formData.billing_branch || 'RS'} onChange={handleChange}><option value="RS">RS</option><option value="RB">RB</option></select></div>
          <div className="input-group"><label>Design Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd || 0} onChange={handleChange} /></div>
          <div className="input-group"><label>Separation Cost ($)</label><input type="number" name="separation_cost_usd" value={formData.separation_cost_usd || 0} readOnly /></div>
          <div className="input-group"><label>Total Cost ($)</label><input type="text" value={(formData.total_cost_usd || 0).toLocaleString('en-US', {style:'currency', currency:'USD'})} readOnly /></div>
          <div className="input-group checkbox-group"><label><input type="checkbox" name="is_approved" checked={formData.is_approved || false} onChange={handleChange} /> Approved</label></div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3}></textarea></div>
        </div>
      );
    } 
    // --- NEW: ZAIN GROUP EDIT FORM ---
else if (clientType.includes('zain group')) {
        const FIXED_SEPARATION_COST_USD_ZAIN = 150;
        return (
             <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="input-group"><label>Product</label><input name="product_description" value={formData.product_description || ''} onChange={handleChange} required /></div>
                <div className="input-group"><label>Code</label><select name="code_id" value={formData.code_id || ''} onChange={handleChange} required><option value="">Select a code...</option>{availableCodes.map(c => <option key={c.id} value={c.id}>{c.code_value}</option>)}</select></div>
                <div className="input-group"><label>Size</label><input name="size" value={formData.size || ''} onChange={handleChange} /></div>
                <div className="input-group"><label>Date</label><input type="date" name="order_date" value={formData.order_date || ''} onChange={handleChange} required /></div>
                <div className="input-group"><label>Finish Date</label><input type="date" name="finish_date" value={formData.finish_date || ''} onChange={handleChange} /></div>
                <div className="input-group"><label>Design Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd || 0} onChange={handleChange} /></div>
                <div className="input-group"><label>Separation Cost ($)</label><input type="number" name="separation_cost_usd" value={FIXED_SEPARATION_COST_USD_ZAIN} readOnly /></div>
                <div className="input-group"><label>Total Cost ($)</label><input type="text" value={((formData.design_cost_usd || 0) + FIXED_SEPARATION_COST_USD_ZAIN).toLocaleString('en-US', {style:'currency', currency:'USD'})} readOnly /></div>
                <div className="input-group checkbox-group"><label><input type="checkbox" name="is_approved" checked={formData.is_approved || false} onChange={handleChange} /> Approved</label></div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3}></textarea></div>
            </div>
        );
    }
    else { // Normal Client
      return (
        <div className="form-grid">
            <div className="input-group"><label>Product Name (English)</label><input name="product_description" value={formData.product_description || ''} onChange={handleChange} required /></div>
            <div className="input-group"><label>Product Name (Arabic)</label><input name="product_description_ar" value={formData.product_description_ar || ''} onChange={handleChange} /></div>
            <div className="input-group"><label>Date</label><input type="date" name="order_date" value={formData.order_date || ''} onChange={handleChange} required /></div>
            <div className="input-group"><label>Cost ($)</label><input type="number" step="0.01" name="design_cost_usd" value={formData.design_cost_usd || 0} onChange={handleChange} /></div>
            <div className="input-group"><label>Cost (IQD) (auto)</label><input type="text" value={(formData.total_cost_iqd || 0).toLocaleString()} readOnly /></div>
            <div className="input-group checkbox-group"><label><input type="checkbox" name="is_approved" checked={formData.is_approved || false} onChange={handleChange} /> Approved</label></div>
        </div>
      );
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header"><h2>Edit Order: {order.code}</h2><button onClick={onClose} className="close-button"><FaTimes /></button></header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">{renderEditForm()}</div>
          <footer className="modal-footer">
              <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
              <button type="submit">Save Changes</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default EditOrderModal;