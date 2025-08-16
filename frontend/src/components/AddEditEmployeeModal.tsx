// frontend/src/components/AddEditEmployeeModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

interface Employee {
  id?: number;
  full_name: string;
  position: string;
  hire_date: string;
}
interface Props {
  employeeToEdit: Partial<Employee> | null;
  onClose: () => void;
  onSave: () => void;
}
const initialState = { full_name: '', position: '', hire_date: new Date().toISOString().split('T')[0] };

function AddEditEmployeeModal({ employeeToEdit, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Employee>>(initialState);
  const isEditMode = employeeToEdit && employeeToEdit.id;

  useEffect(() => {
    if (isEditMode) {
      // Format date correctly for the input field
      setFormData({
        ...employeeToEdit,
        hire_date: new Date(employeeToEdit.hire_date!).toISOString().split('T')[0]
      });
    } else {
      setFormData(initialState);
    }
  }, [employeeToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const promise = isEditMode
      ? api.put(`/employees/${employeeToEdit!.id}`, formData)
      : api.post('/employees', formData);

    toast.promise(promise, {
      loading: 'Saving employee...',
      success: () => {
        onSave();
        onClose();
        return `Employee ${isEditMode ? 'updated' : 'created'} successfully!`;
      },
      error: (err) => err.message || 'An error occurred.',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group"><label>Full Name</label><input name="full_name" value={formData.full_name || ''} onChange={handleChange} required /></div>
              <div className="input-group"><label>Position</label><input name="position" value={formData.position || ''} onChange={handleChange} /></div>
              <div className="input-group"><label>Hire Date</label><input type="date" name="hire_date" value={formData.hire_date || ''} onChange={handleChange} required /></div>
            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button-primary">{isEditMode ? 'Save Changes' : 'Create Employee'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
export default AddEditEmployeeModal;