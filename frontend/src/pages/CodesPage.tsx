// frontend/src/pages/CodesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaRecycle } from 'react-icons/fa';

interface Code {
  id: number;
  code_value: string;
  status: 'available' | 'used' | 'recyclable';
  product_description: string | null;
}

function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientType, setClientType] = useState('Royal Can');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW: State for next available codes ---
  const [nextCodes, setNextCodes] = useState({
    'Royal Can': 'N/A',
    'Karwanchi': 'N/A',
    'Zain Group': 'N/A'
  });

  const fetchCodes = useCallback(() => {
    setIsLoading(true);
    let url = `/codes?client_type=${encodeURIComponent(clientType)}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    api.get(url)
      .then(data => setCodes(data))
      .catch(err => toast.error('Could not fetch codes.'))
      .finally(() => setIsLoading(false));
  }, [clientType, searchTerm]);

  const fetchNextAvailable = useCallback(() => {
    const clientTypes = ['Royal Can', 'Karwanchi', 'Zain Group'];
    const promises = clientTypes.map(type => 
      api.get(`/codes/next-available?client_type=${encodeURIComponent(type)}`)
        .then(code => ({ type, code: code.code_value }))
        .catch(() => ({ type, code: 'N/A' }))
    );

    Promise.all(promises).then(results => {
      const nextCodesUpdate = results.reduce((acc, result) => {
        acc[result.type] = result.code;
        return acc;
      }, {} as Record<string, string>);
      setNextCodes(prev => ({...prev, ...nextCodesUpdate}));
    });
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCodes();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [clientType, searchTerm, fetchCodes]);

  useEffect(() => {
    fetchNextAvailable();
  }, [fetchNextAvailable]);

  // --- NEW: Handler for recycling a code ---
  const handleRecycleCode = (codeId: number) => {
    toast.promise(
      api.patch(`/codes/${codeId}/recycle`, {}),
      {
        loading: 'Recycling code...',
        success: () => {
          fetchCodes(); // Refresh all lists
          fetchNextAvailable(); // Refresh the next available codes display
          return 'Code is now available!';
        },
        error: 'Could not recycle code.'
      }
    );
  };

  const availableCodes = codes.filter(c => c.status === 'available');
  const usedCodes = codes.filter(c => c.status === 'used');
  const recyclableCodes = codes.filter(c => c.status === 'recyclable');

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Code Management</h1>
        <p>Manage your inventory of client-specific order codes.</p>
      </div>

      {/* --- NEW: Next Available Code Display --- */}
      <div className="dashboard-grid" style={{marginBottom: '2em'}}>
        <div className="stat-card"><h5>Next Royal Can</h5><p className="stat-card-value">{nextCodes['Royal Can']}</p></div>
        <div className="stat-card"><h5>Next Karwanchi</h5><p className="stat-card-value">{nextCodes['Karwanchi']}</p></div>
        <div className="stat-card"><h5>Next Zain Group</h5><p className="stat-card-value">{nextCodes['Zain Group']}</p></div>
      </div>

      <div className="action-bar">
        <select value={clientType} onChange={(e) => setClientType(e.target.value)} style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border-color)'}}>
          <option value="Royal Can">Royal Can</option>
          <option value="Karwanchi">Karwanchi</option>
          <option value="Zain Group">Zain Group</option>
        </select>
        <div className="search-bar">
          <span className="search-icon"><FaSearch /></span>
          <input type="text" placeholder="Search codes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="dashboard-grid" style={{gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'start'}}>
        <div className="code-list-container">
          <header className="client-list-header"><span>Available Codes ({availableCodes.length})</span></header>
          {isLoading ? <p style={{padding: '1em'}}>Loading...</p> : availableCodes.map(code => (
            <div className="client-row" key={code.id}><span>{code.code_value}</span></div>
          ))}
        </div>
        <div className="code-list-container">
          <header className="client-list-header" style={{gridTemplateColumns: '1fr 1fr'}}><span>Used Code</span><span>Product</span></header>
          {isLoading ? <p style={{padding: '1em'}}>Loading...</p> : usedCodes.map(code => (
            <div className="client-row" style={{gridTemplateColumns: '1fr 1fr'}} key={code.id}>
                <span>{code.code_value}</span>
                <span style={{fontSize: '12px', color: '#888'}}>{code.product_description || 'N/A'}</span>
            </div>
          ))}
        </div>
        <div className="code-list-container">
          <header className="client-list-header" style={{gridTemplateColumns: '1fr auto'}}><span>Recyclable Codes ({recyclableCodes.length})</span><span>Action</span></header>
          {isLoading ? <p style={{padding: '1em'}}>Loading...</p> : recyclableCodes.map(code => (
            <div className="client-row" style={{gridTemplateColumns: '1fr auto'}} key={code.id}>
              <span>{code.code_value}</span>
              {/* --- NEW: Recycle Button --- */}
              <button onClick={() => handleRecycleCode(code.id)} title="Make this code available again" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#10b981'}}>
                <FaRecycle />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodesPage;