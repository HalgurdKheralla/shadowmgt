// frontend/src/components/LocationRevenueChart.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import hook

interface LocationData {
  city: string;
  totalRevenue: number;
}

function LocationRevenueChart() {
  const { currency } = useCurrency(); // <-- Use hook
  const [data, setData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/dashboard/revenue-by-location?currency=${currency}`) // <-- Pass currency
      .then(data => setData(data || []))
      .catch(err => console.error("Failed to fetch location data:", err))
      .finally(() => setIsLoading(false));
  }, [currency]); // <-- Re-fetch when currency changes

  const maxValue = data.length > 0 ? Math.max(...data.map(d => Number(d.totalRevenue))) : 0;

  return (
    <div className="stat-card" style={{ height: '100%' }}>
      <h4 style={{ margin: 0, marginBottom: '20px', color: 'var(--main-text-color)' }}>Revenue by Location</h4>
      {isLoading ? (
        <p>Loading location data...</p>
      ) : (
        <div>
          {data.length > 0 ? data.map(item => (
            <div key={item.city} style={{ marginBottom: '15px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500, color: 'var(--main-text-color)' }}>{item.city}</span>
                {/* Dynamic currency formatting */}
                <span style={{ color: 'var(--sidebar-text-color)' }}>{Number(item.totalRevenue).toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--sidebar-link-hover-bg)', borderRadius: '4px' }}>
                <div style={{ 
                  height: '100%', 
                  width: maxValue > 0 ? `${(Number(item.totalRevenue) / maxValue) * 100}%` : '0%', 
                  backgroundColor: '#3b82f6', 
                  borderRadius: '4px' 
                }}></div>
              </div>
            </div>
          )) : <p>No location data available for this ledger.</p>}
        </div>
      )}
    </div>
  );
}

export default LocationRevenueChart;