import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

const POPULAR_STATIONS = [
  { code: 'NDLS', name: 'NDLS - New Delhi', city: 'New Delhi - Delhi' },
  { code: 'MMCT', name: 'MMCT - Mumbai Central', city: 'Mumbai - Maharashtra' },
  { code: 'HWH', name: 'HWH - Howrah Jn', city: 'Kolkata - West Bengal' },
  { code: 'SBC', name: 'SBC - KSR Bengaluru', city: 'Bengaluru - Karnataka' },
  { code: 'MAS', name: 'MAS - Chennai Central', city: 'Chennai - Tamil Nadu' }
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'schedule' | 'pnr' | 'running' | 'results' | 'berths'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Profile Popover Dropdown State
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search Controls
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 9)); // Sun, 09 Aug 2026
  const [displayDateStr, setDisplayDateStr] = useState('Sun, 09 Aug');

  // Popover State
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Refs for Outside Click Detection
  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Working Multi-Month Calendar Navigation
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(7); // 0-indexed: 7 = August

  // Train Data & Seat Selection
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [error, setError] = useState('');

  // Global Click Outside Handler to Close Any Open Dialog Box
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Search Popovers (From, To, Calendar) if click is outside search container
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
        setShowCalendar(false);
      }
      // Close Profile Menu if click is outside profile wrapper
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Auto Check Local Token on Load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } })
        .then(res => {
          setUser(res.data);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Format Date String
  const formatDateDisplay = (dateObj) => {
    const dayName = DAY_NAMES[dateObj.getDay()];
    const dateNum = dateObj.getDate().toString().padStart(2, '0');
    const monthName = MONTH_NAMES[dateObj.getMonth()].substring(0, 3);
    return `${dayName}, ${dateNum} ${monthName}`;
  };

  // Swap Stations Function
  const handleSwap = (e) => {
    e.stopPropagation();
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: authEmail,
        password: authPassword
      });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Check email & password.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration Submission (.in Domain Admin Assignment)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name: authName,
        email: authEmail,
        password: authPassword
      });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setShowProfileMenu(false);
  };

  // Fetch Trains
  const fetchTrains = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events`);
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]);
        fetchBerths(res.data[0].id);
      }
      setCurrentPage('results');
    } catch (err) {
      setError('Cannot connect to backend service.');
    }
  };

  // Fetch Seats
  const fetchBerths = async (eventId) => {
    try {
      const res = await axios.get(`${API_BASE}/events/${eventId}/seats`);
      setSeats(res.data);
    } catch (err) {
      console.error('Fetch berths error:', err);
    }
  };

  // Multi-Month Calendar Calculations
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleSelectCalDate = (dayNum) => {
    const newDate = new Date(calYear, calMonth, dayNum);
    setSelectedDate(newDate);
    setDisplayDateStr(formatDateDisplay(newDate));
    setShowCalendar(false);
  };

  return (
    <div>
      {/* Header */}
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

      {/* HOMEPAGE */}
      {currentPage === 'home' && (
        <main>
          <section className="ct-hero-section">
            <h1 className="ct-hero-title">Train Ticket Booking</h1>
            <p className="ct-hero-subtitle">Easy IRCTC Login</p>

            <div className="ct-search-container" ref={searchContainerRef}>
              <div className="ct-search-box-left">
                <div className="ct-from-box" onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowCalendar(false); }}>
                  <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
                  <div className="ct-field-content">
                    <span className="ct-field-label">From</span>
                    <span className="ct-field-value">{fromStation}</span>
                  </div>

                  {showFromDropdown && (
                    <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                      <input className="ct-dropdown-input" placeholder="Search for a station/city" autoFocus />
                      <div className="ct-dropdown-section-title">Popular Searches</div>
                      {POPULAR_STATIONS.map(st => (
                        <div key={st.code} className="ct-station-item" onClick={() => { setFromStation(st.name); setShowFromDropdown(false); }}>
                          <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                          <div>
                            <div className="ct-station-code">{st.name}</div>
                            <div className="ct-station-city">{st.city}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ct-swap-overlap-btn" onClick={handleSwap} title="Swap Stations">
                  ⇄
                </div>

                <div className="ct-to-box" onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowCalendar(false); }}>
                  <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
                  <div className="ct-field-content">
                    <span className="ct-field-label">To</span>
                    <span className="ct-field-value">{toStation}</span>
                  </div>

                  {showToDropdown && (
                    <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                      <input className="ct-dropdown-input" placeholder="Search for a station/city" autoFocus />
                      <div className="ct-dropdown-section-title">Popular Searches</div>
                      {POPULAR_STATIONS.map(st => (
                        <div key={st.code} className="ct-station-item" onClick={() => { setToStation(st.name); setShowToDropdown(false); }}>
                          <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                          <div>
                            <div className="ct-station-code">{st.name}</div>
                            <div className="ct-station-city">{st.city}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ct-search-box-right">
                <div className="ct-date-box" onClick={() => { setShowCalendar(!showCalendar); setShowFromDropdown(false); setShowToDropdown(false); }}>
                  <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div className="ct-field-content">
                    <span className="ct-field-label">Departure Date</span>
                    <span className="ct-field-value">{displayDateStr}</span>
                  </div>

                  {showCalendar && (
                    <div className="ct-calendar-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="ct-cal-header">
                        <span className="ct-cal-nav" onClick={handlePrevMonth}>‹</span>
                        <span>{MONTH_NAMES[calMonth]} {calYear}</span>
                        <span className="ct-cal-nav" onClick={handleNextMonth}>›</span>
                      </div>
                      <div className="ct-cal-days">
                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                      <div className="ct-cal-grid">
                        {[...Array(firstDayIndex)].map((_, i) => <div key={`blank-${i}`} />)}
                        {[...Array(daysInCalMonth)].map((_, idx) => {
                          const dayNum = idx + 1;
                          const isSelected = selectedDate.getDate() === dayNum && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear;
                          return (
                            <div
                              key={dayNum}
                              className={`ct-cal-date ${isSelected ? 'active' : ''}`}
                              onClick={() => handleSelectCalDate(dayNum)}
                            >
                              {dayNum}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button className="ct-search-cta" onClick={fetchTrains}>SEARCH</button>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <svg width="18" height="18" fill="#003366" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                IRCTC Authorised Partner
              </div>

              <div style={{ maxWidth: '650px', margin: '0 auto', background: '#1c1917', color: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                <div>
                  <span style={{ background: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INTRODUCING</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem', color: '#ffffff' }}>AI SEAT FINDER</h3>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Powered by TARA</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Find Confirmed Tickets Easily</h4>
                  <button style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, marginTop: '0.5rem', cursor: 'pointer' }}>Download App</button>
                </div>
              </div>
            </div>
          </section>

          {/* LOWER SECTIONS */}
          <section className="ct-features-section">
            <h2 className="ct-section-heading">Why Book Train Tickets With Confirmtkt?</h2>

            <div className="ct-features-grid-clean">
              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l4 4-4 4M8 18l-4-4 4-4"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Train Alternates & Prediction</div>
                  <div className="ct-feat-desc">Travel smart with our same train alternates and prediction feature and improve your chance of getting train tickets.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">UPI Enabled Secured Payment</div>
                  <div className="ct-feat-desc">Payment on Confirmtkt is highly secured. Easy UPI and other multiple payment modes available.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Free Cancellation on Train Tickets</div>
                  <div className="ct-feat-desc">Get a full refund on train tickets by opting our free cancellation feature.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Train Booking & Enquiry Support</div>
                  <div className="ct-feat-desc">24X7 customer support, for any train enquiry & booking related queries call 08068243910.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Instant Refund & Cancellation</div>
                  <div className="ct-feat-desc">Get an instant refund and book your next Train ticket easily.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Live Train Status Tracking</div>
                  <div className="ct-feat-desc">Train status & notification of your train tickets.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="ct-rcb-banner-box">
            <div>
              <div className="ct-rcb-title">Confirmtkt: Official Train Ticketing Partner of The Royal Challengers Bengaluru</div>
              <div className="ct-rcb-sub">Come join us on the RCB Express and become a #TrainTicketKing. Win match tickets and more exciting prizes!</div>
            </div>
            <button className="ct-search-cta" style={{ borderRadius: '8px', minHeight: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>PLAY NOW</button>
          </section>

          <section className="ct-info-container">
            <h2 className="ct-info-h2">IRCTC Ticket Booking on ConfirmTkt</h2>
            <p className="ct-info-text">
              ConfirmTkt is one of the highest rated App to book IRCTC train tickets online. You can book a train ticket on ConfirmTkt App or website with your existing IRCTC login credentials or create a new one. Increase your chance of getting a Confirm train ticket with our best-in-market same-train alternates and prediction feature.
            </p>
          </section>
        </main>
      )}

      {/* FOOTER */}
      <footer className="ct-footer">
        <div className="ct-footer-bottom">
          Confirmtkt.com is official partner of IRCTC to book IRCTC train tickets and Railway train enquiry.<br/>
          © Copyright @ Le Travenues Technology Ltd. All Rights Reserved.
        </div>
      </footer>

      {/* REAL AUTH MODAL (CLOSES ON BACKDROP CLICK) */}
      {showAuthModal && (
        <div className="ct-modal-bg" onClick={() => setShowAuthModal(false)}>
          <div className="ct-auth-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ct-auth-title">{authMode === 'login' ? 'Login to ConfirmTkt' : 'Create New Account'}</h2>
            <p className="ct-auth-sub">
              {authMode === 'login' ? 'Enter your registered credentials below.' : 'Register with email. Note: .in emails automatically get Admin privileges!'}
            </p>

            {authError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
              {authMode === 'register' && (
                <div className="ct-input-group">
                  <label className="ct-input-label">Full Name</label>
                  <input className="ct-form-input" required value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Rahul Sharma" />
                </div>
              )}

              <div className="ct-input-group">
                <label className="ct-input-label">Email Address</label>
                <input className="ct-form-input" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="user@gmail.com or admin@company.in" />
              </div>

              <div className="ct-input-group">
                <label className="ct-input-label">Password</label>
                <input className="ct-form-input" type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button type="submit" className="ct-auth-submit" disabled={authLoading}>
                {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Register Account')}
              </button>
            </form>

            <div className="ct-auth-switch">
              {authMode === 'login' ? (
                <>Don't have an account? <span onClick={() => setAuthMode('register')}>Register Here</span></>
              ) : (
                <>Already have an account? <span onClick={() => setAuthMode('login')}>Sign In</span></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
