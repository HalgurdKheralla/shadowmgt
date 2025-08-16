// frontend/src/components/RevenueChart.tsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext'; // <-- Import hook

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

interface ChartData {
  labels: string[];
  data: number[];
}

function RevenueChart() {
  const { currency } = useCurrency(); // <-- Use hook
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    // We pass the currency to the backend API call
    api.get(`/dashboard/daily-revenue?currency=${currency}`)
      .then(data => {
        setChartData(data);
      })
      .catch(err => console.error("Failed to fetch chart data:", err));
  }, [currency]); // <-- Re-fetch when currency changes

  const data = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: `Daily Order Value (${currency})`, // <-- Dynamic label
        data: chartData?.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: `Daily Order Value (Current Month)` },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value: any) {
                    // Dynamic currency symbol on Y-axis
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(value);
                }
            }
        }
    }
  };
  
  if (!chartData) {
    return <div>Loading Chart...</div>
  }

  return <Bar options={options} data={data} />;
}

export default RevenueChart;