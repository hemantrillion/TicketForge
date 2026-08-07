import React from 'react';
import LoginButton from './ui/buttons/LoginButton';
import UserProfilePopover from './ui/popovers/UserProfilePopover';

export default function Header({ user, currentPage, setCurrentPage, showProfileMenu, setShowProfileMenu, handleLogout, setShowAuthModal, setAuthMode, profileMenuRef }) {
  return (
    <header className="ct-header">
      <div className="ct-brand" onClick={() => setCurrentPage('home')}>
        <span className="ct-logo-text">Confirm<span className="ct-logo-green">tkt</span></span>
      </div>

      <div className="ct-nav-links">
        <span className={`ct-nav-item ${currentPage === 'pnr' ? 'active' : ''}`} onClick={() => setCurrentPage('pnr')}>PNR STATUS</span>
        <span className={`ct-nav-item ${currentPage === 'running' ? 'active' : ''}`} onClick={() => setCurrentPage('running')}>TRAIN RUNNING STATUS</span>
        <span className={`ct-nav-item ${currentPage === 'schedule' ? 'active' : ''}`} onClick={() => setCurrentPage('schedule')}>TRAIN SCHEDULE</span>
        
        <div className="ct-user-badge-wrapper" ref={profileMenuRef}>
          <LoginButton
            user={user}
            onClick={user ? () => setShowProfileMenu(!showProfileMenu) : () => { setShowAuthModal(true); setAuthMode('login'); }}
          />

          {user && showProfileMenu && (
            <UserProfilePopover user={user} handleLogout={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
