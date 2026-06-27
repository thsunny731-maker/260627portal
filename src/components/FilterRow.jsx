import React from 'react';

export default function FilterRow({ categories, category, setCategory, sort, setSort, showArchived, setShowArchived }) {
  return (
    <div className="glass" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 24px', margin: '0 0 24px 0', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Category:</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: '120px' }}>
          <option value="All">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Sort:</label>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
          <option value="Recently updated">Recently updated</option>
          <option value="Recently added">Recently added</option>
          <option value="A-Z">A-Z</option>
          <option value="Category">Category</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          Show archived
        </label>
      </div>
    </div>
  );
}
