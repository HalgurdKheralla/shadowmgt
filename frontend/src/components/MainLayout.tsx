// frontend/src/components/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { FaBarcode } from 'react-icons/fa';
import { useCurrency } from '../context/CurrencyContext';

// Make sure LuShoppingCart is included in this import
import {
  LuLayoutDashboard, LuPackage, LuShapes, LuShoppingCart, LuUsers, LuTags,
  LuBuilding, LuMapPin, LuSettings, LuLogOut
} from 'react-icons/lu';

import logo from '../assets/logo.png'; // Import the full logo
import { FaBook, FaSitemap } from 'react-icons/fa';

// Define a type for the decoded token payload
interface DecodedToken {
  id: number;
  name: string;
  role: string;
}

function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const handleCurrencyToggle = () => {
    setCurrency(currency === 'USD' ? 'IQD' : 'USD');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUser(decoded);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <img src={logo} alt="Shadow Logo" className="sidebar-logo" />
          <hr className="sidebar-divider" />
          
          {user && (
            <div className="user-profile">
              <div className="avatar"></div>
              <div className="user-name">{user.name}</div>
              <div className="user-handle">{user.role}</div>
            </div>
          )}

          <nav className="sidebar-nav">
            <NavLink to="/dashboard"><LuLayoutDashboard /> Dashboard</NavLink>
            <NavLink to="/clients"><LuUsers /> Clients</NavLink>
            {/* --- CORRECTED ICONS --- */}
            <NavLink to="/orders"><LuShoppingCart /> Orders</NavLink>
            <NavLink to="/codes"><FaBarcode /> Code Management</NavLink>
            <NavLink to="/invoicing"><LuShoppingCart /> Invoicing</NavLink>
            <NavLink to="/payroll/employees"><FaUsers /> Employees</NavLink> {/* <-- ADD LINK */}
            <NavLink to="/accounting/expenses"><FaMoneyBillWave /> Expenses</NavLink>
            <NavLink to="/accounting/reports/profit-and-loss"><FaChartLine /> P&L Report</NavLink>
            <NavLink to="/reports/client-debts"><FaFileInvoiceDollar /> Client Debts</NavLink>
            <NavLink to="/accounting/general-ledger"><FaBook /> General Ledger</NavLink>
            <NavLink to="/accounting/chart-of-accounts"><FaSitemap /> Chart of Accounts</NavLink>
            <NavLink to="/settings"><LuSettings /> Settings</NavLink>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="dark-mode-toggle">
            {/* <span>Dark Mode</span> */}
          </div>
                    {/* --- NEW CURRENCY TOGGLE --- */}
          <div className="dark-mode-toggle" style={{marginTop: '10px'}}>
            <span>IQD Ledger</span>
            <label className="switch">
              <input type="checkbox" checked={currency === 'USD'} onChange={handleCurrencyToggle} />
              <span className="slider"></span>
            </label>
            <span>USD Ledger</span>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            <LuLogOut /> Logout
          </button>
            <label className="switch">
              <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
              <span className="slider"></span>
            </label>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;


<NavLink to="/invoicing"><LuShoppingCart /> Invoicing</NavLink>