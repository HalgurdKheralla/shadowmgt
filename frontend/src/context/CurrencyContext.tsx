// frontend/src/context/CurrencyContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the possible currency types
type Currency = 'USD' | 'IQD';

// Define the shape of our context data
interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

// Create the context with a default undefined value
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Create the Provider component. This component will hold the actual state.
export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state by trying to read from localStorage first, defaulting to 'USD'
  const [currency, setCurrency] = useState<Currency>(() => {
    const savedCurrency = localStorage.getItem('ledgerCurrency');
    return (savedCurrency === 'USD' || savedCurrency === 'IQD') ? savedCurrency : 'USD';
  });

  // This effect will save the currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ledgerCurrency', currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};