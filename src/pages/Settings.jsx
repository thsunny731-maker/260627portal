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
        setMsg('현재 코드가 일치하지 않습니다');
        return;
      }
    }
    await setAdminCode(newCode);
    setHasCode(hasAdminCode());
    setCurrentCode('');
    setNewCode('');
    setMsg('관리자 코드가 성공적으로 변경되었습니다.');
  };

  const handleDisableCode = async () => {
    if (hasCode) {
      const valid = await verifyAdminCode(currentCode);
      if (!valid) {
        setMsg('현재 코드가 일치하지 않아 비활성화할 수 없습니다.');
        return;
      }
    }
    await setAdminCode('');
    setHasCode(false);
    setCurrentCode('');
    setNewCode('');
    setMsg('관리자 코드가 비활성화되었습니다.');
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
          alert(`성공적으로 ${count}개의 앱 데이터를 가져왔습니다 (메타데이터만).`);
        }
      } catch (err) {
        alert('잘못된 백업 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const apps = await getApps();
      for (let app of apps) {
        await deleteApp(app.id);
      }
      alert('모든 앱 데이터가 삭제되었습니다.');
    }
  };

  return (
    <div style={{ padding: '24px 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <button className="btn-icon" onClick={() => window.location.hash = '#/'} style={{ background: 'var(--bg-surface)' }}>← 뒤로 가기</button>
        <h1 style={{ fontSize: '28px', margin: 0 }}>설정</h1>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>관리자 코드</h2>
        <form onSubmit={handleSetCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          {hasCode && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)' }}>현재 코드</label>
              <input type="password" value={currentCode} onChange={e => setCurrentCode(e.target.value)} required />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)' }}>새 코드</label>
            <input type="password" value={newCode} onChange={e => setNewCode(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary">코드 저장</button>
            {hasCode && <button type="button" className="btn-secondary" onClick={handleDisableCode}>비활성화</button>}
          </div>
          {msg && <div style={{ color: 'var(--primary-color)', fontSize: '14px', marginTop: '8px' }}>{msg}</div>}
        </form>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>데이터 백업 (Option B)</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>메타데이터만 내보냅니다. 백업 파일 크기를 줄이기 위해 썸네일은 제외됩니다.</p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExport}>JSON 내보내기</button>
          <label className="btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
            JSON 가져오기
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="glass-panel" style={{ border: '1px solid var(--danger-color)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--danger-color)', fontWeight: '600' }}>위험 구역 (Danger Zone)</h2>
        <button className="btn-primary" style={{ background: 'var(--danger-color)', boxShadow: 'none' }} onClick={handleClearAll}>
          모든 데이터 삭제
        </button>
      </div>
    </div>
  );
}
