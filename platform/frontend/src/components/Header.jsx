import React, { useRef } from 'react';

export default function Header({ user, currentPage, setCurrentPage, showProfileMenu, setShowProfileMenu, handleLogout, setShowAuthModal, setAuthMode }) {
  const profileMenuRef = useRef(null);

  return (
    <header className="ct-header">
      <div className="ct-brand" onClick={() => setCurrentPage('home')}>
        <span className="ct-logo-text">Confirm<span className="ct-logo-green">tkt</span></span>
      </div>

      <div className="ct-nav-links">
        <span className={`ct-nav-item ${currentPage === 'pnr' ? 'active' : ''}`} onClick={() => setCurrentPage('pnr')}>PNR STATUS</span>
        <span className={`ct-nav-item ${currentPage === 'running' ? 'active' : ''}`} onClick={() => setCurrentPage('running')}>TRAIN RUNNING STATUS</span>
        <span className={`ct-nav-item ${currentPage === 'schedule' ? 'active' : ''}`} onClick={() => setCurrentPage('schedule')}>TRAIN SCHEDULE</span>
        
        {user ? (
          <div className="ct-user-badge-wrapper" ref={profileMenuRef}>
            <div className="ct-user-badge" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <span>👤 {user.name}</span>
              {user.role === 'admin' && <span className="ct-admin-tag">ADMIN</span>}
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>▾</span>
            </div>

            {showProfileMenu && (
              <div className="ct-profile-popover" onClick={(e) => e.stopPropagation()}>
                <div className="ct-profile-name">{user.name}</div>
                <div className="ct-profile-email">{user.email}</div>

                <button className="ct-btn-logout-red" onClick={handleLogout}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ct-user-badge" onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}>
            <span>👤 LOGIN</span>
          </div>
        )}
      </div>
    </header>
  );
}
