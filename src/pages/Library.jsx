import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import FilterRow from '../components/FilterRow';
import Card from '../components/Card';
import Modal from '../components/Modal';
import AppForm from '../components/AppForm';
import { getApps, saveApp } from '../services/db';
import { getUnlockState, setUnlockState, verifyAdminCode, subscribeUnlock, hasAdminCode } from '../services/auth';

export default function Library() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Recently updated');
  const [showArchived, setShowArchived] = useState(false);
  
  const [unlocked, setUnlocked] = useState(getUnlockState());
  
  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [editingApp, setEditingApp] = useState(null);
  
  useEffect(() => {
    loadApps();
    const unsub = subscribeUnlock(setUnlocked);
    return unsub;
  }, []);

  const loadApps = async () => {
    const data = await getApps();
    setApps(data);
  };

  const handleAdminClick = () => {
    if (unlocked) {
      setUnlockState(false);
    } else {
      if (!hasAdminCode()) {
        window.location.hash = '#/settings';
      } else {
        setIsAuthModalOpen(true);
        setAuthCode('');
        setAuthError('');
      }
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    const valid = await verifyAdminCode(authCode);
    if (valid) {
      setUnlockState(true);
      setIsAuthModalOpen(false);
    } else {
      setAuthError('잘못된 관리자 코드입니다');
    }
  };

  const handleSaveApp = async (appData) => {
    await saveApp(appData);
    await loadApps();
    setEditingApp(null);
  };

  const handleArchiveRestore = async (app) => {
    const updated = { ...app, archived: !app.archived };
    await saveApp(updated);
    await loadApps();
  };

  const handleOpenApp = async (id) => {
    const app = apps.find(a => a.id === id);
    if (app) {
      await saveApp({ ...app, lastOpenedAt: new Date().toISOString() });
      loadApps();
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(apps.map(a => a.category));
    return Array.from(cats).sort();
  }, [apps]);

  const filteredApps = useMemo(() => {
    let result = apps;
    if (!showArchived) result = result.filter(a => !a.archived);
    if (category !== 'All') result = result.filter(a => a.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(s) ||
        a.url.toLowerCase().includes(s) ||
        a.category.toLowerCase().includes(s) ||
        (a.notes || '').toLowerCase().includes(s)
      );
    }
    
    result.sort((a, b) => {
      if (sort === 'Recently updated') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      if (sort === 'Recently added') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sort === 'A-Z') return a.title.localeCompare(b.title);
      if (sort === 'Category') return a.category.localeCompare(b.category);
      return 0;
    });
    
    return result;
  }, [apps, search, category, sort, showArchived]);

  return (
    <>
      <Header 
        search={search} setSearch={setSearch} 
        onAddClick={() => setEditingApp({})} 
        onAdminClick={handleAdminClick} 
      />
      
      <FilterRow 
        categories={categories} category={category} setCategory={setCategory}
        sort={sort} setSort={setSort}
        showArchived={showArchived} setShowArchived={setShowArchived}
      />
      
      {apps.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px', margin: '32px auto', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>앱을 찾을 수 없습니다</h2>
          <p style={{ color: 'var(--text-secondary)' }}>앱을 추가하거나 백업 데이터를 가져와 시작하세요.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
            <button className="btn-primary" onClick={handleAdminClick}>앱 추가</button>
            <button className="btn-secondary" onClick={() => window.location.hash = '#/settings'}>설정으로 이동</button>
          </div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
          <h2>검색 결과 없음</h2>
          <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => { setSearch(''); setCategory('All'); setShowArchived(true); }}>필터 초기화</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          paddingBottom: '64px'
        }}>
          {filteredApps.map(app => (
            <Card key={app.id} app={app} onEdit={() => setEditingApp(app)} onArchiveRestore={handleArchiveRestore} onOpen={handleOpenApp} />
          ))}
        </div>
      )}

      {isAuthModalOpen && (
        <Modal title="관리자 잠금 해제" onClose={() => setIsAuthModalOpen(false)}>
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="password" 
              autoFocus
              value={authCode} 
              onChange={e => setAuthCode(e.target.value)} 
              placeholder="관리자 코드 입력" 
              required
            />
            {authError && <div style={{ color: 'var(--danger-color)', fontSize: '14px' }}>{authError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsAuthModalOpen(false)}>취소</button>
              <button type="submit" className="btn-primary">잠금 해제</button>
            </div>
          </form>
        </Modal>
      )}

      {editingApp && (
        <Modal title={editingApp.id ? '앱 수정' : '앱 추가'} onClose={() => setEditingApp(null)}>
          <AppForm 
            initialData={editingApp} 
            onSave={handleSaveApp} 
            onCancel={() => setEditingApp(null)} 
            existingCategories={categories}
          />
        </Modal>
      )}
    </>
  );
}
