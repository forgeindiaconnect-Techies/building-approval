import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function ApplicationFilters({ searchTerm, setSearchTerm, workerFilter, setWorkerFilter, statusFilter, setStatusFilter, onReset, workers = [] }) {
  const activeFiltersCount = (searchTerm ? 1 : 0) + (workerFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0);

  return (
    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Search Bar with Instant Clear */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '0', width: '100%', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search application, customer, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: searchTerm ? '2.2rem' : '0.85rem', width: '100%', fontSize: '0.825rem' }} 
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.1rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Select Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', width: 'auto', flex: '1 1 auto' }}>
          <select 
            className="form-control" 
            value={workerFilter} 
            onChange={e => setWorkerFilter(e.target.value)} 
            style={{ flex: '1 1 120px', minWidth: '110px', fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
          >
            <option value="ALL">All Workers ▼</option>
            {workers.map(w => (
              <option key={w.id || w.username} value={w.username}>{w.name || w.username}</option>
            ))}
            <option value="Pooja">Pooja</option>
            <option value="Arun">Arun</option>
            <option value="Priya">Priya</option>
          </select>

          <select 
            className="form-control" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            style={{ flex: '1 1 120px', minWidth: '120px', fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
          >
            <option value="ALL">All Status ▼</option>
            <option value="pending">Pending Documents</option>
            <option value="under_review">Documents Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button 
            className="btn btn-outline" 
            onClick={onReset} 
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
          >
            <Filter size={13} /> Reset {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

      </div>
    </div>
  );
}
