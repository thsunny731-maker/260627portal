import React, { useState } from 'react';
import { getUnlockState } from '../services/auth';

export default function Card({ app, onEdit, onArchiveRestore, onOpen }) {
  const [showMenu, setShowMenu] = useState(false);
  const unlocked = getUnlockState();

  const handleOpen = () => {
    onOpen(app.id);
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(app.url);
    setShowMenu(false);
  };

  let hostname = '';
  try {
    hostname = new URL(app.url).hostname;
  } catch(e) {}

  return (
    <div className="glass hover-lift" style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', opacity: app.archived ? 0.6 : 1 }}>
      {/* Thumbnail */}
      <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.05)', position: 'relative' }}>
        {app.thumbnail?.value ? (
          <img 
            src={app.thumbnail.value} 
            alt={app.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            이미지 없음
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.title}
          </h3>
          <div style={{ position: 'relative' }}>
            <button className="btn-icon" style={{ padding: '4px' }} onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
              ⋮
            </button>
            {showMenu && (
              <div 
                className="glass" 
                style={{ position: 'absolute', right: 0, top: '100%', padding: '4px', display: 'flex', flexDirection: 'column', minWidth: '120px', zIndex: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start' }} onClick={() => { handleOpen(); setShowMenu(false); }}>새 탭에서 열기</button>
                <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start' }} onClick={handleCopy}>링크 복사</button>
                {unlocked && (
                  <>
                    <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start' }} onClick={() => { onEdit(app); setShowMenu(false); }}>수정</button>
                    <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start', color: 'var(--danger-color)' }} onClick={() => { onArchiveRestore(app); setShowMenu(false); }}>
                      {app.archived ? '복구' : '보관'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge">{app.category}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hostname}
          </span>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleOpen}>
            열기
          </button>
        </div>
      </div>
    </div>
  );
}
