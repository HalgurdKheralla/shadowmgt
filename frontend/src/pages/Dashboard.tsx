// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { LuUsers, LuShoppingCart, LuDollarSign, LuTrendingUp } from 'react-icons/lu';
import RevenueChart from '../components/RevenueChart';
import LocationRevenueChart from '../components/LocationRevenueChart';

interface SummaryData {
  totalSales: number;
  revenue: number;
  totalCustomers: number;
  totalOrders: number;
}

// The StatCard now accepts the currency type as a prop
const StatCard = ({ title, value, icon, change, currency }: { title: string; value: number; icon: React.ReactNode; change: number; currency: 'USD' | 'IQD' }) => {
  const isPositive = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span>{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-body">
        <p className="stat-card-value">
          {/* This now uses Intl.NumberFormat for proper currency display */}
          {value.toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
          <LuTrendingUp />
          <span>{change}%</span>
        </div>
      </div>
    </div>
  );
};


function Dashboard() {
  const { currency } = useCurrency();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/dashboard/summary?currency=${currency}`);
        setSummaryData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummaryData();
  }, [currency]);
  
  if (isLoading) {
    return <h1>Dashboard</h1>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        {summaryData ? (
          <>
            {/* The cards now pass the currency prop */}
            <StatCard title="Total Sales" value={summaryData.totalSales} icon={<LuDollarSign />} change={6.5} currency={currency} />
            <StatCard title="Revenue" value={summaryData.revenue} icon={<LuTrendingUp />} change={8.2} currency={currency} />
            <StatCard title="Customers" value={summaryData.totalCustomers} icon={<LuUsers />} change={-2.5} currency={currency} />
            <StatCard title="Orders" value={summaryData.totalOrders} icon={<LuShoppingCart />} change={12.5} currency={currency} />
          </>
        ) : (
          <p>Could not load summary data.</p>
        )}
      </div>

      <div className="dashboard-charts-grid">
        <div className="stat-card">
          <RevenueChart />
        </div>
        <LocationRevenueChart />
      </div>
    </div>
  );
}

export default Dashboard;