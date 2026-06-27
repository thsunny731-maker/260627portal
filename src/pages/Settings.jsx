import React, { useState, useEffect } from 'react';
import { hasAdminCode, setAdminCode, verifyAdminCode } from '../services/auth';
import { getApps, saveApp, deleteApp } from '../services/db';

export default function Settings() {
  const [hasCode, setHasCode] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [msg, setMsg] = useState('');
  
  useEffect(() => {
    setHasCode(hasAdminCode());
  }, []);

  const handleSetCode = async (e) => {
    e.preventDefault();
    if (hasCode) {
      const valid = await verifyAdminCode(currentCode);
      if (!valid) {
        setMsg('Current code is incorrect');
        return;
      }
    }
    await setAdminCode(newCode);
    setHasCode(hasAdminCode());
    setCurrentCode('');
    setNewCode('');
    setMsg('Admin code updated successfully.');
  };

  const handleDisableCode = async () => {
    if (hasCode) {
      const valid = await verifyAdminCode(currentCode);
      if (!valid) {
        setMsg('Current code is incorrect to disable.');
        return;
      }
    }
    await setAdminCode('');
    setHasCode(false);
    setCurrentCode('');
    setNewCode('');
    setMsg('Admin code disabled.');
  };

  const handleExport = async () => {
    const apps = await getApps();
    const exportData = apps.map(a => {
      const { thumbnail, ...rest } = a;
      return rest;
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          let count = 0;
          for (let app of data) {
            await saveApp(app);
            count++;
          }
          alert(`Successfully imported ${count} apps (metadata only).`);
        }
      } catch (err) {
        alert('Invalid import file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      const apps = await getApps();
      for (let app of apps) {
        await deleteApp(app.id);
      }
      alert('All apps cleared.');
    }
  };

  return (
    <div style={{ padding: '24px 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <button className="btn-icon" onClick={() => window.location.hash = '#/'} style={{ background: 'var(--bg-surface)' }}>← Back</button>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Settings</h1>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Admin Code</h2>
        <form onSubmit={handleSetCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          {hasCode && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Current Code</label>
              <input type="password" value={currentCode} onChange={e => setCurrentCode(e.target.value)} required />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)' }}>New Code</label>
            <input type="password" value={newCode} onChange={e => setNewCode(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary">Save Code</button>
            {hasCode && <button type="button" className="btn-secondary" onClick={handleDisableCode}>Disable</button>}
          </div>
          {msg && <div style={{ color: 'var(--primary-color)', fontSize: '14px', marginTop: '8px' }}>{msg}</div>}
        </form>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Data Backup (Option B)</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Exports metadata only. Thumbnails are excluded for smaller export files.</p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExport}>Export JSON</button>
          <label className="btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
            Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="glass-panel" style={{ border: '1px solid var(--danger-color)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--danger-color)', fontWeight: '600' }}>Danger Zone</h2>
        <button className="btn-primary" style={{ background: 'var(--danger-color)', boxShadow: 'none' }} onClick={handleClearAll}>
          Clear All Data
        </button>
      </div>
    </div>
  );
}
