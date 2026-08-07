import React, { useState, useEffect } from 'react';
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

  // Swap Stations Function (Exact Center Overlap)
  const handleSwap = (e) => {
    e.stopPropagation();
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Real Login Submission
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

  // Real Registration Submission (.in Domain Admin Assignment)
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

  // Berth Selection Toggle (Allow Deselect)
  const handleToggleBerth = (seat) => {
    if (seat.status !== 'available' && !selectedSeatIds.includes(seat.id)) return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= passengerCount) {
        setError(`Limit reached: ${passengerCount} berth(s) selected.`);
        return;
      }
      setError('');
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  return (
    <div>
      {/* Pure White Header (No Flights / Hotels, Only Train & Auth Options) */}
      <header className="ct-header">
        <div className="ct-brand" onClick={() => setCurrentPage('home')}>
          <span className="ct-logo-text">Confirm<span className="ct-logo-green">tkt</span></span>
        </div>

        <div className="ct-nav-links">
          <span className={`ct-nav-item ${currentPage === 'pnr' ? 'active' : ''}`} onClick={() => setCurrentPage('pnr')}>PNR STATUS</span>
          <span className={`ct-nav-item ${currentPage === 'running' ? 'active' : ''}`} onClick={() => setCurrentPage('running')}>TRAIN RUNNING STATUS</span>
          <span className={`ct-nav-item ${currentPage === 'schedule' ? 'active' : ''}`} onClick={() => setCurrentPage('schedule')}>TRAIN SCHEDULE</span>
          
          {user ? (
            <div className="ct-user-badge" onClick={handleLogout}>
              <span>👤 {user.name}</span>
              {user.role === 'admin' && <span className="ct-admin-tag">ADMIN</span>}
            </div>
          ) : (
            <div className="ct-user-badge" onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}>
              <span>👤 LOGIN</span>
            </div>
          )}
        </div>
      </header>

      {/* ================= HOMEPAGE (EXACT SCREENSHOT ALIGNMENT) ================= */}
      {currentPage === 'home' && (
        <main>
          <section className="ct-hero-section">
            <h1 className="ct-hero-title">Train Ticket Booking</h1>
            <p className="ct-hero-subtitle">Easy IRCTC Login</p>

            {/* SEARCH BOX CONTAINER MATCHING USER SCREENSHOT EXACTLY */}
            <div className="ct-search-container">
              {/* LEFT SECTION: FROM & TO WITH OVERLAPPING SWAP BUTTON */}
              <div className="ct-search-box-left">
                {/* FROM FIELD */}
                <div className="ct-search-field" onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowCalendar(false); }}>
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

                {/* SWAP BUTTON OVERLAPPING VERTICAL DIVIDER LINE EXACTLY IN THE MIDDLE */}
                <div className="ct-swap-overlap-btn" onClick={handleSwap} title="Swap Stations">
                  ⇄
                </div>

                {/* TO FIELD */}
                <div className="ct-search-field" style={{ paddingLeft: '1.75rem' }} onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowCalendar(false); }}>
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

              {/* RIGHT SECTION: DEPARTURE DATE & SEARCH CTA */}
              <div className="ct-search-box-right" style={{ gridTemplateColumns: '1fr' }}>
                <div className="ct-search-field" onClick={() => { setShowCalendar(!showCalendar); setShowFromDropdown(false); setShowToDropdown(false); }}>
                  <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div className="ct-field-content">
                    <span className="ct-field-label">Departure Date</span>
                    <span className="ct-field-value">{displayDateStr}</span>
                  </div>

                  {/* REAL WORKING MULTI-MONTH CALENDAR POPOVER */}
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

              {/* SEARCH CTA BUTTON */}
              <button className="ct-search-cta" onClick={fetchTrains}>SEARCH</button>
            </div>
          </section>
        </main>
      )}

      {/* ================= REAL AUTH MODAL (LOGIN / REGISTER) ================= */}
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
