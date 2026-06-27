import React, { useEffect, useRef } from 'react';
import { getUnlockState, setUnlockState, hasAdminCode } from '../services/auth';

export default function Header({ search, setSearch, onAddClick, onAdminClick }) {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unlocked = getUnlockState();

  return (
    <header className="glass-panel" style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '16px 0', padding: '16px 24px', position: 'sticky', top: '16px', zIndex: 10 }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', flexShrink: 0 }}>Hsunny 모음집</h1>
      
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <input 
          ref={searchRef}
          type="text" 
          placeholder="제목, URL, 카테고리 검색... ( / 키로 포커스)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', padding: '12px 16px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
        {unlocked && (
          <button className="btn-primary hover-lift" onClick={onAddClick}>
            + 앱 추가
          </button>
        )}
        <button 
          className="btn-secondary hover-lift" 
          onClick={onAdminClick}
          style={{ color: unlocked ? 'var(--primary-color)' : 'var(--text-secondary)' }}
        >
          {unlocked ? '🔓 관리자 잠금 해제됨' : '🔒 관리자 잠금됨'}
        </button>
        <button className="btn-icon" onClick={() => window.location.hash = '#/settings'} title="설정">
          ⚙️
        </button>
      </div>
    </header>
  );
}
