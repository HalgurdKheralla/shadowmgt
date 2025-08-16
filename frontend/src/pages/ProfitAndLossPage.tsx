// frontend/src/pages/ProfitAndLossPage.tsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import the currency hook
import toast from 'react-hot-toast';

// --- TYPE DEFINITIONS ---
interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expenseBreakdown: {
    account_name: string;
    total: string;
  }[];
}

// Helper to get the start and end of the current month
const getMonthDateRange = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
};

function ProfitAndLossPage() {
  const { currency } = useCurrency(); // <-- Use the hook to get the current currency
  const { firstDay, lastDay } = getMonthDateRange();
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReportData(null);
    try {
      // --- UPDATED API CALL with currency ---
      const data = await api.get(`/reports/profit-and-loss?startDate=${startDate}&endDate=${endDate}&currency=${currency}`);
      setReportData(data);
    } catch (error) {
      toast.error("Failed to generate report.");
    } finally {
      setIsLoading(false);
    }
  };

  const ProfitCard = ({ title, value }: { title: string; value: number }) => {
    const isProfit = title.toLowerCase().includes('profit') && value >= 0;
    const isLoss = title.toLowerCase().includes('profit') && value < 0;
    const valueColor = isProfit ? '#10b981' : isLoss ? '#ef4444' : 'var(--main-text-color)';

    return (
        <div className="stat-card">
            <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: valueColor }}>
                {value.toLocaleString('en-US', { style: 'currency', currency: currency })}
            </p>
        </div>
    );
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Profit & Loss Statement</h1>
        <p>Analyze your revenue and expenses for the <span style={{fontWeight: 'bold'}}>{currency}</span> ledger.</p>
      </div>

      <div className="stat-card" style={{ marginBottom: '2em' }}>
        <div className="form-grid" style={{ alignItems: 'flex-end' }}>
            <div className="input-group"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="input-group"><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            <button className="button-primary" onClick={handleGenerateReport} disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Report'}</button>
        </div>
      </div>

      {reportData && (
        <div>
            <div className="dashboard-grid" style={{marginBottom: '2em'}}>
                <ProfitCard title="Total Revenue" value={reportData.totalRevenue} />
                <ProfitCard title="Total Expenses" value={reportData.totalExpenses} />
                <ProfitCard title="Net Profit / Loss" value={reportData.netProfit} />
            </div>
            <div className="client-list-container">
                <header className="client-list-header"><span>Expense Category</span><span style={{textAlign: 'right'}}>Total</span></header>
                {reportData.expenseBreakdown.map((item, index) => (
                    <div className="client-row" key={index}>
                        <span>{item.account_name}</span>
                        <span style={{textAlign: 'right'}}>{parseFloat(item.total).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

export default ProfitAndLossPage;