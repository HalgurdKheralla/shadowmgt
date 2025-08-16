// frontend/src/pages/EmployeesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- Make sure useNavigate is imported
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';
import ActionsMenu from '../components/ActionsMenu';
import AddEditEmployeeModal from '../components/AddEditEmployeeModal';

interface Employee {
  id: number;
  full_name: string;
  position: string;
  hire_date: string;
}

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate(); // <-- Initialize the navigate hook

  const fetchEmployees = useCallback(() => {
    setIsLoading(true);
    api.get('/employees')
      .then(data => setEmployees(data))
      .catch(err => toast.error('Could not fetch employees.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };
  
  const handleSave = () => {
    fetchEmployees();
  };

  const handleDelete = (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      api.del(`/employees/${employeeId}`)
        .then(() => {
          toast.success('Employee deleted.');
          fetchEmployees();
        })
        .catch(err => toast.error('Failed to delete employee.'));
    }
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Employees</h1>
        <p>Manage all company employees and their payroll.</p>
      </div>

      <div className="action-bar">
        <div></div>
        <button className="add-new-button" onClick={handleOpenAddModal}>
          <FaPlus /> Add New Employee
        </button>
      </div>

      <div className="client-list-container">
        <header className="client-list-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 50px' }}>
          <span>Full Name</span>
          <span>Position</span>
          <span>Hire Date</span>
          <span>Actions</span>
        </header>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          employees.map(employee => (
            <div className="client-row" key={employee.id} style={{ gridTemplateColumns: '2fr 2fr 1fr 50px' }}>
              <Link to={`/employees/${employee.id}/payroll`}>{employee.full_name}</Link>
              <span>{employee.position}</span>
              <span>{new Date(employee.hire_date).toLocaleDateString()}</span>
              <ActionsMenu
                onView={() => navigate(`/employees/${employee.id}/payroll`)}
                onEdit={() => handleOpenEditModal(employee)}
                onDelete={() => handleDelete(employee.id)}
              />
            </div>
          ))
        )}
      </div>
      
      {isModalOpen && (
        <AddEditEmployeeModal
          employeeToEdit={editingEmployee}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default EmployeesPage;