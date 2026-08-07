import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// Popular Stations list matching Screenshot 4
const POPULAR_STATIONS = [
  { code: 'NDLS', name: 'NDLS - New Delhi', city: 'New Delhi - Delhi' },
  { code: 'HWH', name: 'HWH - Howrah Jn', city: 'Kolkata - West Bengal' },
  { code: 'LTT', name: 'LTT - Lokmanyatilak T', city: 'Mumbai - Maharashtra' },
  { code: 'ADI', name: 'ADI - Ahmedabad Jn', city: 'Ahmedabad - Gujarat' },
  { code: 'NZM', name: 'NZM - H Nizamuddin', city: 'New Delhi - Delhi' }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login' | 'schedule' | 'pnr' | 'results' | 'berths'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  
  // Search Controls
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [journeyDate, setJourneyDate] = useState('Sun, 09 Aug');
  
  // Dropdown / Popover Modals
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Passenger & Berth Selection State (Deselect / Toggle Fix)
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [activeHolds, setActiveHolds] = useState([]);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto Login
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'passenger@confirmtkt.com',
          password: 'UserPassword123!'
        });
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
      } catch (err) {
        try {
          const regRes = await axios.post(`${API_BASE}/auth/register`, {
            email: 'passenger@confirmtkt.com',
            password: 'UserPassword123!',
            name: 'Rahul Sharma'
          });
          setUser(regRes.data.user);
          setToken(regRes.data.token);
          localStorage.setItem('token', regRes.data.token);
        } catch (regErr) {
          console.error('Auto login error:', regErr);
        }
      }
    };
    autoLogin();
  }, []);

  // Fetch Train List
  const fetchTrains = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/events`);
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]);
        fetchBerths(res.data[0].id);
      }
      setCurrentPage('results');
    } catch (err) {
      setError('Cannot connect to ConfirmTkt server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Seats/Berths
  const fetchBerths = async (eventId) => {
    try {
      const res = await axios.get(`${API_BASE}/events/${eventId}/seats`);
      setSeats(res.data);
    } catch (err) {
      console.error('Fetch berths error:', err);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  // Swap Stations
  const handleSwap = () => {
    const tmp = fromStation;
    setFromStation(toStation);
    setToStation(tmp);
  };

  // Proper Berth Selection & Deselection Toggle
  const handleToggleBerth = async (seat) => {
    if (seat.status !== 'available' && !selectedSeatIds.includes(seat.id)) return;

    // Deselect if already selected
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.id));
      return;
    }

    // Limit selection to passenger count
    if (selectedSeatIds.length >= passengerCount) {
      setError(`You have selected ${passengerCount} berth(s) for ${passengerCount} passenger(s). Increase passenger count to select more.`);
      return;
    }

    setError('');
    try {
      const res = await axios.post(
        `${API_BASE}/seats/${seat.id}/hold`,
        { session_id: `sess_${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
      setActiveHolds([...activeHolds, res.data]);
      if (selectedEvent) fetchBerths(selectedEvent.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Berth already held by another user.');
    }
  };

  return (
    <div>
      {/* Exact Pure White Header matching Screenshots 1-5 */}
      <header className="ct-header">
        <div className="ct-brand" onClick={() => setCurrentPage('home')}>
          <svg className="ct-logo-img" viewBox="0 0 200 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" fill="#41af5d"/>
            <path d="M14 22 L20 28 L30 16" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/>
            <text x="48" y="29" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#1e293b">Confirm<tspan fill="#41af5d">tkt</tspan></text>
          </svg>
        </div>

        <div className="ct-nav-links">
          {currentPage === 'schedule' ? (
            <>
              <span className="ct-nav-item" onClick={() => setCurrentPage('home')}>IRCTC Tickets</span>
              <span className="ct-nav-item" onClick={() => setCurrentPage('pnr')}>PNR Status</span>
              <span className="ct-nav-item" onClick={() => setCurrentPage('home')}>Train Running Status</span>
              <span className="ct-nav-item active" onClick={() => setCurrentPage('schedule')}>Train Schedule</span>
              <span className="ct-nav-item">MORE ▾</span>
            </>
          ) : (
            <>
              <span className="ct-nav-item" onClick={() => window.open('https://www.ixigo.com/flights', '_blank')}>FLIGHTS</span>
              <span className="ct-nav-item" onClick={() => window.open('https://www.ixigo.com/hotels', '_blank')}>HOTELS</span>
              <div className="ct-login-btn" onClick={() => setCurrentPage('login')}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                <span>{user ? user.name : 'LOGIN'}</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ================= HOMEPAGE (SCREENSHOT 1) ================= */}
      {currentPage === 'home' && (
        <div>
          <section className="ct-hero-section">
            <h1 className="ct-hero-title">Train Ticket Booking</h1>
            <p className="ct-hero-subtitle">Easy IRCTC Login</p>

            {/* Search Box Widget */}
            <div className="ct-search-box">
              {/* FROM FIELD */}
              <div className="ct-search-field" onClick={() => { setShowFromDropdown(true); setShowToDropdown(false); setShowCalendar(false); }}>
                <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
                <div className="ct-field-content">
                  <span className="ct-field-label">From</span>
                  <span className="ct-field-value">{fromStation}</span>
                </div>

                {/* Station Dropdown Popover (Screenshot 4) */}
                {showFromDropdown && (
                  <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="ct-dropdown-input"
                      placeholder="Search for a station/city"
                      autoFocus
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                    <div className="ct-dropdown-section-title">Popular Searches</div>
                    {POPULAR_STATIONS.map(st => (
                      <div key={st.code} className="ct-station-item" onClick={() => { setFromStation(st.name); setShowFromDropdown(false); }}>
                        <svg width="18" height="18" fill="#41af5d" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                        <div>
                          <div className="ct-station-code">{st.name}</div>
                          <div className="ct-station-city">{st.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP BUTTON */}
              <div className="ct-swap-icon" onClick={handleSwap}>⇄</div>

              {/* TO FIELD */}
              <div className="ct-search-field" onClick={() => { setShowToDropdown(true); setShowFromDropdown(false); setShowCalendar(false); }}>
                <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
                <div className="ct-field-content">
                  <span className="ct-field-label">To</span>
                  <span className="ct-field-value">{toStation}</span>
                </div>

                {showToDropdown && (
                  <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="ct-dropdown-input"
                      placeholder="Search for a station/city"
                      autoFocus
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                    <div className="ct-dropdown-section-title">Popular Searches</div>
                    {POPULAR_STATIONS.map(st => (
                      <div key={st.code} className="ct-station-item" onClick={() => { setToStation(st.name); setShowToDropdown(false); }}>
                        <svg width="18" height="18" fill="#41af5d" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                        <div>
                          <div className="ct-station-code">{st.name}</div>
                          <div className="ct-station-city">{st.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE FIELD */}
              <div className="ct-search-field" onClick={() => { setShowCalendar(true); setShowFromDropdown(false); setShowToDropdown(false); }}>
                <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div className="ct-field-content">
                  <span className="ct-field-label">Departure Date</span>
                  <span className="ct-field-value">{journeyDate}</span>
                </div>

                {/* Calendar Popover (Screenshot 3) */}
                {showCalendar && (
                  <div className="ct-calendar-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="ct-cal-header">
                      <span>‹</span>
                      <span>August 2026</span>
                      <span>›</span>
                    </div>
                    <div className="ct-cal-days">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="ct-cal-grid">
                      {[...Array(31)].map((_, idx) => {
                        const day = idx + 1;
                        const isSelected = day === 9;
                        return (
                          <div
                            key={day}
                            className={`ct-cal-date ${isSelected ? 'active' : ''}`}
                            onClick={() => { setJourneyDate(`Sun, 0${day} Aug`); setShowCalendar(false); }}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SEARCH BUTTON */}
              <button className="ct-search-cta" onClick={fetchTrains}>SEARCH</button>
            </div>

            {/* Authorised Partner Badge & AI Seat Finder Banner */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <svg width="18" height="18" fill="#003366" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                IRCTC Authorised Partner
              </div>

              <div style={{ maxWidth: '650px', margin: '0 auto', background: '#1c1917', color: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textStyle: 'left' }}>
                  <span style={{ background: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INTRODUCING</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem' }}>AI SEAT FINDER</h3>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Powered by TARA</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Find Confirmed Tickets Easily</h4>
                  <button style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, marginTop: '0.5rem', cursor: 'pointer' }}>Download App</button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section ("Why Book Train Tickets With Confirmtkt?") (Screenshot 5) */}
          <section className="ct-features-section">
            <h2 className="ct-section-heading">Why Book Train Tickets With Confirmtkt?</h2>

            <div className="ct-features-grid-clean">
              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l4 4-4 4M8 18l-4-4 4-4"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Train Alternates & Prediction</div>
                  <div className="ct-feat-desc">Travel smart with our same train alternates and prediction feature and improve your chance of getting train tickets.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">UPI Enabled Secured Payment</div>
                  <div className="ct-feat-desc">Payment on Confirmtkt is highly secured. Easy UPI and other multiple payment modes available.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Free Cancellation on Train Tickets</div>
                  <div className="ct-feat-desc">Get a full refund on train tickets by opting our free cancellation feature.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Train Booking & Enquiry Support</div>
                  <div className="ct-feat-desc">24X7 customer support, for any train enquiry & booking related queries call 08068243910.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Instant Refund & Cancellation</div>
                  <div className="ct-feat-desc">Get an instant refund and book your next Train ticket easily.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div className="ct-feat-title">Live Train Status Tracking</div>
                  <div className="ct-feat-desc">Train status & notification of your train tickets.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= LOGIN PROFILE SCREEN (SCREENSHOT 2) ================= */}
      {currentPage === 'login' && (
        <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 70px)', padding: '3rem 1rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <svg width="40" height="40" fill="#cbd5e1" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--ct-border)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
              <svg width="22" height="22" fill="#475569" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"/></svg>
              Sign in with Mobile Number
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--ct-border)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              Sign in with Google
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--ct-border)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
              <svg width="22" height="22" fill="#475569" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Privacy Policy
            </div>
          </div>
        </div>
      )}

      {/* ================= TRAIN TIME TABLE PAGE (SCREENSHOT 5) ================= */}
      {currentPage === 'schedule' && (
        <div>
          <section style={{ background: 'var(--ct-green-tint)', padding: '3rem 1rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ct-text-dark)', marginBottom: '1.5rem' }}>Train Time Table</h1>

            <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ct-border)' }}>
              <input
                style={{ flex: 1, padding: '1rem 1.5rem', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                placeholder="Enter the train number or name"
              />
              <button style={{ background: 'var(--ct-green)', color: '#ffffff', border: 'none', padding: '0 2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                Check Train Schedule
              </button>
            </div>
          </section>

          <section className="ct-features-section">
            <h2 className="ct-section-heading">Why Book Train Tickets With Confirmtkt?</h2>

            <div className="ct-features-grid-clean">
              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">📈</div>
                <div>
                  <div className="ct-feat-title">Train Alternates & Prediction</div>
                  <div className="ct-feat-desc">Travel smart with our same train alternates and prediction feature and improve your chance of getting train tickets.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">💳</div>
                <div>
                  <div className="ct-feat-title">UPI Enabled Secured Payment</div>
                  <div className="ct-feat-desc">Payment on Confirmtkt is highly secured. Easy UPI and other multiple payment modes available.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">🛡️</div>
                <div>
                  <div className="ct-feat-title">Free Cancellation on Train Tickets</div>
                  <div className="ct-feat-desc">Get a full refund on train tickets by opting our free cancellation feature.</div>
                </div>
              </div>

              <div className="ct-feat-item">
                <div className="ct-feat-icon-circle">📞</div>
                <div>
                  <div className="ct-feat-title">Train Booking & Support</div>
                  <div className="ct-feat-desc">24X7 customer support, for any train enquiry & booking related queries call 08068243910.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= TRAIN SEARCH RESULTS PAGE ================= */}
      {currentPage === 'results' && (
        <div className="ct-results-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Trains between {fromStation} and {toStation}
          </h2>

          {events.map((evt) => (
            <div key={evt.id} className="ct-train-row-card">
              <div className="ct-train-info-header">
                <div>
                  <div className="ct-train-num-name">{evt.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Runs On: M T W T F S S</div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--ct-green)', fontWeight: 800 }}>ConfirmTkt Guaranteed Seat</span>
              </div>

              <div className="ct-class-matrix">
                <div className="ct-class-box active" onClick={() => setCurrentPage('berths')}>
                  <div className="ct-class-name">3A (AC 3 Tier)</div>
                  <div className="ct-status-text ct-status-avail">AVAILABLE-0042</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹2,150</div>
                </div>
                <div className="ct-class-box" onClick={() => setCurrentPage('berths')}>
                  <div className="ct-class-name">2A (AC 2 Tier)</div>
                  <div className="ct-status-text ct-status-avail">AVAILABLE-0012</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹3,100</div>
                </div>
                <div className="ct-class-box" onClick={() => setCurrentPage('berths')}>
                  <div className="ct-class-name">1A (AC First)</div>
                  <div className="ct-status-text ct-status-wl">WL-04</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹4,850</div>
                </div>
                <div className="ct-class-box" onClick={() => setCurrentPage('berths')}>
                  <div className="ct-class-name">SL (Sleeper)</div>
                  <div className="ct-status-text ct-status-avail">AVAILABLE-0120</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹650</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= COACH BERTH SELECTION PAGE ================= */}
      {currentPage === 'berths' && (
        <div className="ct-results-container">
          <div className="ct-berth-selection-container">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ct-text-dark)', marginBottom: '1rem' }}>
              Coach B1 Berth Selection & Passenger Count
            </h2>

            {/* Passenger Count Selection Controls */}
            <div className="ct-passengers-control">
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Select Number of Passengers:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="ct-pass-btn" onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}>-</button>
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{passengerCount}</span>
                <button className="ct-pass-btn" onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}>+</button>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({selectedSeatIds.length} / {passengerCount} berths selected)</span>
            </div>

            {/* Structured Coach Layout Tile Grid */}
            <div className="ct-coupe-grid">
              {seats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                return (
                  <div
                    key={seat.id}
                    className={`ct-berth-tile ${seat.status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleBerth(seat)}
                  >
                    <div className="ct-berth-num">{seat.seat_label.split(' ')[1] || seat.seat_label}</div>
                    <div className="ct-berth-code">{seat.berth_type}</div>
                  </div>
                );
              })}
            </div>

            {selectedSeatIds.length > 0 && (
              <div style={{ background: 'var(--ct-green-light)', border: '1.5px solid var(--ct-green)', padding: '1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--ct-green)', fontSize: '1rem', fontWeight: 800 }}>
                    🔒 {selectedSeatIds.length} Berth(s) Locked in Redis (5-Min Lock)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Click a selected berth to deselect or click proceed to enter passenger details.
                  </p>
                </div>
                <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.75rem 1.5rem' }} onClick={() => setCurrentPage('home')}>
                  Proceed to Book →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
