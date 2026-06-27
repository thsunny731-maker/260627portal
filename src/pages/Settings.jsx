import React, { useState, useEffect } from 'react';
import { hasAdminCode, setAdminCode, verifyAdminCode, getUnlockState, setUnlockState, subscribeUnlock } from '../services/auth';

export default function Settings() {
  const [hasCode, setHasCode] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [msg, setMsg] = useState('');
  
  const [unlocked, setUnlocked] = useState(getUnlockState());
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  
  useEffect(() => {
    setHasCode(hasAdminCode());
    const unsub = subscribeUnlock(setUnlocked);
    return unsub;
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const valid = await verifyAdminCode(authCode);
    if (valid) {
      setUnlockState(true);
      setAuthError('');
    } else {
      setAuthError('잘못된 관리자 코드입니다');
    }
  };

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

  if (hasCode && !unlocked) {
    return (
      <div style={{ padding: '24px 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <button className="btn-icon" onClick={() => window.location.hash = '#/'} style={{ background: 'var(--bg-surface)' }}>← 뒤로 가기</button>
          <h1 style={{ fontSize: '28px', margin: 0 }}>설정</h1>
        </div>
        <div className="glass-panel" style={{ marginBottom: '24px', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>설정 잠금 해제</h2>
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              value={authCode} 
              onChange={e => setAuthCode(e.target.value)} 
              placeholder="관리자 코드 입력" 
              required
              autoFocus
            />
            {authError && <div style={{ color: 'var(--danger-color)', fontSize: '14px' }}>{authError}</div>}
            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>잠금 해제</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <button className="btn-icon" onClick={() => window.location.hash = '#/'} style={{ background: 'var(--bg-surface)' }}>← 뒤로 가기</button>
        <h1 style={{ fontSize: '28px', margin: 0 }}>설정</h1>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>관리자 코드 변경</h2>
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
    </div>
  );
}
