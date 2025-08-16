// frontend/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const EXCHANGE_RATE_KEY = 'NORMAL_CLIENT_EXCHANGE_RATE';

function Settings() {
  const [rate, setRate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the current setting value when the page loads
  useEffect(() => {
    api.get(`/settings/${EXCHANGE_RATE_KEY}`)
      .then(setting => {
        setRate(setting.setting_value);
      })
      .catch(err => {
        console.error("Failed to fetch settings:", err);
        toast.error('Could not load settings.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/settings/${EXCHANGE_RATE_KEY}`, {
        setting_value: rate
      });
      toast.success('Setting saved successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save setting.');
    }
  };
  
  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h2>System Settings</h2>
      <div style={{ border: '1px solid #ccc', padding: '1em', marginTop: '1em' }}>
        <h3>Exchange Rates</h3>
        <div>
          <label htmlFor="exchangeRate">Normal Client Exchange Rate ($1 = x IQD):</label>
          <input
            id="exchangeRate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            style={{ marginLeft: '10px', width: '100px' }}
          />
        </div>
        <button onClick={handleSave} style={{ marginTop: '1em' }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;