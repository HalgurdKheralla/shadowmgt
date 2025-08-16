// frontend/src/components/ActionsMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaEllipsisH, FaEye, FaEdit, FaTrash, FaPlus, FaCheckSquare } from 'react-icons/fa';

// --- UPDATED PROPS ---
// We make the actions that are not on every menu optional with '?'
interface Props {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddOrder?: () => void;      // Optional: For the Clients page
  onChangeStatus?: () => void;   // Optional: For the Orders page
}

function ActionsMenu({ onView, onEdit, onDelete, onAddOrder, onChangeStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setIsOpen(false);
  };

  return (
    <div className="actions-menu-container" ref={menuRef}>
      <button className="actions-menu-button" onClick={() => setIsOpen(!isOpen)}>
        <FaEllipsisH size={16} />
      </button>

      {isOpen && (
        <div className="actions-menu-dropdown">
          {/* --- These buttons are always shown --- */}
          <button onClick={() => handleActionClick(onView)}><FaEye /> View</button>
          <button onClick={() => handleActionClick(onEdit)}><FaEdit /> Edit</button>

          {/* --- These buttons are now conditional --- */}
          {onAddOrder && <button onClick={() => handleActionClick(onAddOrder)}><FaPlus /> Add Order</button>}
          {onChangeStatus && <button onClick={() => handleActionClick(onChangeStatus)}><FaCheckSquare /> Change Status</button>}

          <button onClick={() => handleActionClick(onDelete)} className="delete-action"><FaTrash /> Delete</button>
        </div>
      )}
    </div>
  );
}

export default ActionsMenu;