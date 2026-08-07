import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'search' | 'pnr' | 'running'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [activeHold, setActiveHold] = useState(null);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('berths'); // 'berths' | 'passenger_modal' | 'ers_ticket'

  // ConfirmTkt Search State
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [quota, setQuota] = useState('TATKAL');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [freeCancellation, setFreeCancellation] = useState(true);
  const [pnrInput, setPnrInput] = useState('284-9876541');
  const [pnrResult, setPnrResult] = useState(null);

  const [passenger, setPassenger] = useState({
    name: 'Rahul Sharma',
    age: '29',
    gender: 'Male',
    berthPref: 'Lower Berth (LB)',
    irctcUsername: 'rahul_confirmtkt',
    mobile: '9876543210'
  });

  const handleSwap = () => {
    const tmp = fromStation;
    setFromStation(toStation);
    setToStation(tmp);
  };

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
          console.error('Auto login failed:', regErr);
        }
      }
    };
    autoLogin();
  }, []);

  // Fetch Trains
  const fetchTrains = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/events`);
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]);
        fetchBerths(res.data[0].id);
      }
      setActiveTab('search');
    } catch (err) {
      setError('Cannot connect to ConfirmTkt Backend. Ensure Express server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Coach Berths
  const fetchBerths = async (eventId) => {
    try {
      const seatsRes = await axios.get(`${API_BASE}/events/${eventId}/seats`);
      setSeats(seatsRes.data);
    } catch (err) {
      console.error('Fetch berths error:', err);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  // Hold Berth (5-Min Redis Lock)
  const handleHoldBerth = async (seat) => {
    if (seat.status !== 'available') return;
    setError('');
    setSelectedSeat(seat);

    try {
      const res = await axios.post(
        `${API_BASE}/seats/${seat.id}/hold`,
        { session_id: `sess_${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveHold(res.data);
      if (selectedEvent) fetchBerths(selectedEvent.id);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message || 'Berth is currently held by another passenger!');
      } else {
        setError('Failed to claim berth hold.');
      }
    }
  };

  // Submit Reservation & Pay
  const handleConfirmReservation = async () => {
    if (!selectedSeat || !activeHold || !selectedEvent) return;
    setError('');
    setLoading(true);

    const idempotencyKey = `confirmtkt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // 1. Create Booking with PNR
      const bookingRes = await axios.post(
        `${API_BASE}/bookings`,
        {
          event_id: selectedEvent.id,
          seat_ids: [selectedSeat.id],
          passenger_name: passenger.name,
          passenger_age: parseInt(passenger.age),
          passenger_gender: passenger.gender,
          berth_pref: passenger.berthPref,
          irctc_username: passenger.irctcUsername,
          free_cancellation: freeCancellation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );

      const createdBooking = bookingRes.data.booking || bookingRes.data;
      setBooking(createdBooking);

      // 2. Submit Payment
      const paymentRes = await axios.post(
        `${API_BASE}/payments`,
        {
          booking_id: createdBooking.booking_id || createdBooking.id,
          amount: createdBooking.total_amount,
          card_token: 'tok_visa_success'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayment(paymentRes.data);
      setStep('ers_ticket');
      if (selectedEvent) fetchBerths(selectedEvent.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Check PNR Status
  const handleCheckPNR = () => {
    setPnrResult({
      pnr: pnrInput,
      train: '12951 / RAJDHANI EXP',
      from: 'NDLS - New Delhi',
      to: 'MMCT - Mumbai Central',
      date: '01 Sep 2026',
      class: '3A',
      passenger: passenger.name,
      status: 'CNF (Confirmed)',
      coach: 'B1',
      berth: '24 (Lower Berth)'
    });
  };

  return (
    <div>
      {/* Top Utility Header */}
      <div className="ct-top-bar">
        <div className="ct-top-links">
          <a href="https://www.ixigo.com/flights?utm_source=confirmtkt&utm_medium=desktop" target="_blank" rel="noreferrer" className="ct-top-link">✈️ Flights</a>
          <a href="https://www.abhibus.com/?utm_source=confirmtkt&utm_medium=desktop" target="_blank" rel="noreferrer" className="ct-top-link">🚌 BUS</a>
          <a href="https://www.ixigo.com/hotels?utm_source=confirmtkt&utm_medium=desktop" target="_blank" rel="noreferrer" className="ct-top-link">🏨 Hotels</a>
          <span className={`ct-top-link ${activeTab === 'pnr' ? 'active' : ''}`} onClick={() => setActiveTab('pnr')}>📋 PNR Status</span>
          <span className={`ct-top-link ${activeTab === 'running' ? 'active' : ''}`} onClick={() => setActiveTab('running')}>📍 Running Status</span>
          <span className="ct-top-link">MORE ▾</span>
        </div>
        <div>
          {user ? <span>👋 Welcome, <strong>{user.name}</strong></span> : <span>Login / Register</span>}
        </div>
      </div>

      {/* Main Brand Navbar */}
      <header className="ct-main-header">
        <div className="ct-brand-box" onClick={() => setActiveTab('home')}>
          <span className="ct-brand-logo">confirmtkt</span>
          <span className="ct-irctc-badge">🛡️ IRCTC Authorised Partner</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <span style={{ cursor: 'pointer', color: activeTab === 'home' ? 'var(--ct-green)' : 'inherit' }} onClick={() => setActiveTab('home')}>Home</span>
          <span style={{ cursor: 'pointer', color: activeTab === 'search' ? 'var(--ct-green)' : 'inherit' }} onClick={() => setActiveTab('search')}>Train Search</span>
          <span style={{ cursor: 'pointer', color: activeTab === 'pnr' ? 'var(--ct-green)' : 'inherit' }} onClick={() => setActiveTab('pnr')}>PNR Status</span>
          <span style={{ cursor: 'pointer', color: activeTab === 'running' ? 'var(--ct-green)' : 'inherit' }} onClick={() => setActiveTab('running')}>Live Train Tracker</span>
        </div>
      </header>

      <div className="ct-wrapper">
        {error && (
          <div className="ct-train-card" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ================= HOMEPAGE TAB ================= */}
        {activeTab === 'home' && (
          <div>
            {/* Search Widget */}
            <div className="ct-search-card">
              <div className="ct-search-heading">
                <span>Train Ticket Booking | Easy IRCTC Login</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--ct-green)', fontWeight: 800 }}>⚡ IRCTC Official Authorised Partner</span>
              </div>

              <div className="ct-input-row">
                <div className="ct-input-group">
                  <label className="ct-input-label">From</label>
                  <input className="ct-input-field" value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
                </div>

                <button className="ct-swap-button" onClick={handleSwap}>⇄</button>

                <div className="ct-input-group">
                  <label className="ct-input-label">To</label>
                  <input className="ct-input-field" value={toStation} onChange={(e) => setToStation(e.target.value)} />
                </div>

                <div className="ct-input-group">
                  <label className="ct-input-label">Departure Date</label>
                  <input className="ct-input-field" type="date" defaultValue="2026-09-01" />
                </div>

                <div className="ct-input-group">
                  <label className="ct-input-label">Quota</label>
                  <select className="ct-select-field" value={quota} onChange={(e) => setQuota(e.target.value)}>
                    <option value="TATKAL">⚡ TATKAL (10:00 AM Open)</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="PREMIUM TATKAL">PREMIUM TATKAL</option>
                    <option value="LADIES">LADIES</option>
                  </select>
                </div>

                <button className="ct-search-btn" onClick={fetchTrains}>SEARCH TRAINS</button>
              </div>
            </div>

            {/* 6 Value Feature Cards */}
            <div className="ct-features-grid">
              <div className="ct-feature-card">
                <div className="ct-feature-icon">📈</div>
                <div>
                  <div className="ct-feature-title">Train Alternates & Prediction</div>
                  <div className="ct-feature-desc">Improve your chances of getting a confirmed seat with same train alternates and PNR prediction.</div>
                </div>
              </div>
              <div className="ct-feature-card">
                <div className="ct-feature-icon">💳</div>
                <div>
                  <div className="ct-feature-title">UPI Enabled Secured Payment</div>
                  <div className="ct-feature-desc">Payment on ConfirmTkt is highly secured with UPI and multiple payment modes.</div>
                </div>
              </div>
              <div className="ct-feature-card">
                <div className="ct-feature-icon">🛡️</div>
                <div>
                  <div className="ct-feature-title">Free Cancellation on Train Tickets</div>
                  <div className="ct-feature-desc">Get a 100% full refund on train tickets by opting for our free cancellation feature.</div>
                </div>
              </div>
              <div className="ct-feature-card">
                <div className="ct-feature-icon">📞</div>
                <div>
                  <div className="ct-feature-title">Train Booking & Support (08068243910)</div>
                  <div className="ct-feature-desc">24X7 customer support for any train enquiry & booking queries call 08068243910.</div>
                </div>
              </div>
              <div className="ct-feature-card">
                <div className="ct-feature-icon">⚡</div>
                <div>
                  <div className="ct-feature-title">Instant Refund & Cancellation</div>
                  <div className="ct-feature-desc">Get an instant refund directly to your bank account and book your next train ticket easily.</div>
                </div>
              </div>
              <div className="ct-feature-card">
                <div className="ct-feature-icon">📍</div>
                <div>
                  <div className="ct-feature-title">Live Train Status Tracking</div>
                  <div className="ct-feature-desc">Real-time train running status & notification of your train tickets.</div>
                </div>
              </div>
            </div>

            {/* RCB Official Partner Banner */}
            <div className="ct-rcb-banner">
              <div>
                <div className="ct-rcb-title">Confirmtkt: Official Train Ticketing Partner of The Royal Challengers Bengaluru</div>
                <div className="ct-rcb-sub">Come join us on the RCB Express and become a #TrainTicketKing. Win match tickets and exciting prizes!</div>
              </div>
              <button className="ct-search-btn" style={{ background: 'var(--ct-orange)', margin: 0, padding: '0.65rem 1.25rem' }}>PLAY NOW</button>
            </div>

            {/* Comprehensive IRCTC Informational Sections */}
            <div className="ct-info-box">
              <h2 className="ct-info-h2">IRCTC Ticket Booking on ConfirmTkt</h2>
              <p className="ct-info-text">
                ConfirmTkt is one of the highest rated Apps to book IRCTC train tickets online. You can book a train ticket on ConfirmTkt App or website with your existing IRCTC login credentials or create a new one. Increase your chance of getting a Confirm train ticket with our best-in-market same-train alternates and prediction feature. IRCTC train enquiry and booking are backed by a unique and efficient algorithm that predicts your IRCTC PNR in seconds based on historical trends.
              </p>

              <h3 className="ct-info-h3">IRCTC Booking Types</h3>
              <p className="ct-info-text">
                • <strong>IRCTC UTS (Unreserved Ticketing System)</strong>: Paperless ticketing app for unreserved coaches.<br/>
                • <strong>IRCTC Full Tariff Rate (FTR)</strong>: Booking entire coaches or trains for tours/occasions.<br/>
                • <strong>IRCTC General Booking</strong>: Advance train booking with prepone/postpone flexibility.<br/>
                • <strong>IRCTC Tatkal Booking</strong>: Last-minute emergency tickets opening at 10:00 AM (AC) and 11:00 AM (Non-AC).<br/>
                • <strong>IRCTC Ladies Quota</strong>: Reserved sleeper/3A berths for women traveling alone or with infants.
              </p>

              <h3 className="ct-info-h3">How to Book IRCTC Ticket and Use IRCTC Login on ConfirmTkt</h3>
              <p className="ct-info-text">
                1. Select source and destination stations.<br/>
                2. Select date of journey and quota (General/Tatkal).<br/>
                3. Select train from list of available express trains.<br/>
                4. Select class (Sleeper, 3rd AC, 2nd AC, 1st AC).<br/>
                5. Enter passenger details & berth preferences (Lower, Middle, Upper).<br/>
                6. Enter mobile & email for e-ticket delivery.<br/>
                7. Opt for Free Cancellation protection for 100% full refund.<br/>
                8. Pay securely via ConfirmTkt UPI, Card, or NetBanking.<br/>
                9. Enter IRCTC password credentials.<br/>
                10. Receive instant e-Ticket (ERS Slip) via SMS and Email.
              </p>

              <h3 className="ct-info-h3">Valid ID Proofs Required During Train Journey</h3>
              <p className="ct-info-text">
                Passengers must carry one original ID proof during the journey: Aadhaar Card, Passport, Voter ID Card, Driving License, PAN Card, Govt Photo ID, Bank Passbook with photo, Student ID, or Laminated Credit Card.
              </p>

              <h3 className="ct-info-h3">IRCTC Train Ticket Booking FAQ</h3>
              <div className="ct-faq-item">
                <div className="ct-faq-q">Q) What is TATKAL Booking in IRCTC and how is it done?</div>
                <div className="ct-faq-a">A: Tatkal bookings are meant for last-minute travel. AC Tatkal opens at 10:00 AM and Non-AC Tatkal opens at 11:00 AM 1 day prior to journey departure date. Confirmed Tatkal tickets are non-refundable.</div>
              </div>
              <div className="ct-faq-item">
                <div className="ct-faq-q">Q) What is the maximum number of tickets allowed per booking?</div>
                <div className="ct-faq-a">A: Up to 6 passengers per booking in General Quota, and maximum 4 passengers per booking under Tatkal Quota.</div>
              </div>
              <div className="ct-faq-item">
                <div className="ct-faq-q">Q) How does ConfirmTkt increase my chance of getting a confirmed ticket?</div>
                <div className="ct-faq-a">A: ConfirmTkt uses historical data algorithms to calculate CNF prediction scores and suggests same-train alternate boarding points to guarantee a seat.</div>
              </div>

              <h3 className="ct-info-h3">Top Train Routes in India</h3>
              <div className="ct-routes-grid">
                <div className="ct-route-card">
                  <div className="ct-route-dest">Trains to Bengaluru</div>
                  <div className="ct-route-links">via Chennai • Mysore • Hyderabad • New Delhi</div>
                </div>
                <div className="ct-route-card">
                  <div className="ct-route-dest">Trains to New Delhi</div>
                  <div className="ct-route-links">via Patna • Varanasi • Mumbai • Lucknow</div>
                </div>
                <div className="ct-route-card">
                  <div className="ct-route-dest">Trains to Mumbai</div>
                  <div className="ct-route-links">via New Delhi • Pune • Ahmedabad • Surat</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SEARCH RESULTS TAB ================= */}
        {activeTab === 'search' && (
          <div>
            <div className="ct-search-heading" style={{ marginBottom: '1rem' }}>
              <span>Search Results: {fromStation} → {toStation}</span>
              <button className="ct-search-btn" style={{ background: '#64748b', margin: 0, padding: '0.4rem 1rem' }} onClick={() => setActiveTab('home')}>Modify Search</button>
            </div>

            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              return (
                <div key={evt.id} className="ct-train-card" onClick={() => { setSelectedEvent(evt); fetchBerths(evt.id); }}>
                  <div className="ct-train-title">
                    <div>
                      🚆 {evt.title}
                      <div className="ct-runs-on">Runs On: M T W T F S S | Superfast Express</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ct-green)', fontWeight: 800 }}>
                      ✓ ConfirmTkt Verified Route
                    </span>
                  </div>

                  <div className="ct-time-row">
                    <div>
                      <span className="ct-time">16:55</span>
                      <div className="ct-station">New Delhi (NDLS)</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1, color: 'var(--ct-green)', fontWeight: 800 }}>
                      15h 40m • Direct Route
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="ct-time">08:35</span>
                      <div className="ct-station">Mumbai Central (MMCT)</div>
                    </div>
                  </div>

                  <div className="ct-train-matrix">
                    <div className={`ct-class-card ${selectedClass === '3A' ? 'selected' : ''}`} onClick={() => setSelectedClass('3A')}>
                      <span className="ct-matrix-class">3A (AC 3 Tier)</span>
                      <span className="ct-status-green">AVAILABLE - 0042</span>
                      <span className="ct-cnf-tag">CNF 98% High Chance</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹2,150</span>
                    </div>
                    <div className="ct-class-card" onClick={() => setSelectedClass('2A')}>
                      <span className="ct-matrix-class">2A (AC 2 Tier)</span>
                      <span className="ct-status-green">AVAILABLE - 0012</span>
                      <span className="ct-cnf-tag">CNF 95% High Chance</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹3,100</span>
                    </div>
                    <div className="ct-class-card" onClick={() => setSelectedClass('1A')}>
                      <span className="ct-matrix-class">1A (AC First)</span>
                      <span className="ct-status-orange">WL-04</span>
                      <span className="ct-cnf-tag" style={{ background: '#fffbe6', color: '#b45309' }}>CNF 65% Medium</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹4,850</span>
                    </div>
                    <div className="ct-class-card" onClick={() => setSelectedClass('SL')}>
                      <span className="ct-matrix-class">SL (Sleeper)</span>
                      <span className="ct-status-green">AVAILABLE - 0120</span>
                      <span className="ct-cnf-tag">CNF 99% High Chance</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹650</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Coach Layout & Seat Selection */}
            {selectedEvent && (
              <div className="ct-coach-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--ct-navy)', fontWeight: 800 }}>
                      Coach B1 Berth Selection Grid (72 Berths)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ct-text-muted)', marginTop: '0.2rem' }}>
                      Select an available berth to lock it for 5 minutes (Redis SETNX Lock Active).
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>🟢 Available</span>
                    <span>🟡 Held (5-Min Lock)</span>
                    <span>🔴 Booked</span>
                  </div>
                </div>

                <div className="ct-berth-grid">
                  {seats.map((seat) => {
                    const isSelected = selectedSeat?.id === seat.id;
                    return (
                      <div
                        key={seat.id}
                        className={`ct-berth-box ${seat.status} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleHoldBerth(seat)}
                      >
                        <div className="ct-berth-num">{seat.seat_label.split(' ')[1] || seat.seat_label}</div>
                        <div className="ct-berth-type">{seat.berth_type}</div>
                      </div>
                    );
                  })}
                </div>

                {activeHold && (
                  <div style={{ background: 'var(--ct-green-light)', border: '1.5px solid var(--ct-green)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'var(--ct-green)', fontSize: '1.05rem', fontWeight: 900 }}>
                        🔒 Berth Locked in Redis (TTL: 300s)
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ct-navy)', marginTop: '0.25rem' }}>
                        Berth <strong>{selectedSeat?.seat_label}</strong> reserved until <strong>{new Date(activeHold.expires_at).toLocaleTimeString()}</strong>.
                      </p>
                    </div>
                    <button className="ct-search-btn" style={{ margin: 0, padding: '0.75rem 1.5rem' }} onClick={() => setStep('passenger_modal')}>
                      Book Selected Berth →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= PNR STATUS TAB ================= */}
        {activeTab === 'pnr' && (
          <div className="ct-info-box">
            <h2 className="ct-info-h2">Check IRCTC PNR Status & Probability</h2>
            <p className="ct-info-text">Enter your 10-digit PNR number to get live status updates and confirmation probability.</p>

            <div style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '1.5rem 0' }}>
              <input className="ct-input-field" style={{ flex: 1 }} value={pnrInput} onChange={(e) => setPnrInput(e.target.value)} placeholder="Enter 10-Digit PNR Number" />
              <button className="ct-search-btn" style={{ margin: 0 }} onClick={handleCheckPNR}>CHECK PNR</button>
            </div>

            {pnrResult && (
              <div className="ct-ers-box">
                <h3 style={{ color: 'var(--ct-green)', marginBottom: '0.75rem' }}>Status: {pnrResult.status}</h3>
                <p><strong>PNR:</strong> {pnrResult.pnr}</p>
                <p><strong>Train:</strong> {pnrResult.train}</p>
                <p><strong>Journey:</strong> {pnrResult.from} → {pnrResult.to}</p>
                <p><strong>Passenger:</strong> {pnrResult.passenger}</p>
                <p><strong>Coach & Berth:</strong> Coach {pnrResult.coach}, Berth {pnrResult.berth}</p>
              </div>
            )}
          </div>
        )}

        {/* ================= RUNNING STATUS TAB ================= */}
        {activeTab === 'running' && (
          <div className="ct-info-box">
            <h2 className="ct-info-h2">Live Train Running Status Tracker</h2>
            <p className="ct-info-text">Track your train live location, platform number, and delay status in real-time.</p>

            <div style={{ background: '#f8fafc', border: '1px solid var(--ct-border)', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--ct-navy)' }}>12951 | RAJDHANI EXPRESS (NDLS → MMCT)</h3>
              <p style={{ color: 'var(--ct-green)', fontWeight: 800, margin: '0.5rem 0' }}>🟢 Running On Time (Current Station: Vadodara Junction Platform 2)</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ct-text-muted)' }}>Next Stop: Surat (Arrival: 04:15 AM) | Expected Arrival Mumbai Central: 08:35 AM</p>
            </div>
          </div>
        )}
      </div>

      {/* Passenger Entry Modal */}
      {step === 'passenger_modal' && (
        <div className="ct-modal-bg">
          <div className="ct-modal-card">
            <h3 style={{ color: 'var(--ct-navy)', fontSize: '1.3rem', fontWeight: 900, marginBottom: '1rem' }}>
              ConfirmTkt Passenger Details
            </h3>

            <div className="ct-input-group" style={{ marginBottom: '1rem' }}>
              <label className="ct-input-label">IRCTC Username</label>
              <input className="ct-input-field" value={passenger.irctcUsername} onChange={(e) => setPassenger({ ...passenger, irctcUsername: e.target.value })} />
            </div>

            <div className="ct-input-group" style={{ marginBottom: '1rem' }}>
              <label className="ct-input-label">Passenger Name</label>
              <input className="ct-input-field" value={passenger.name} onChange={(e) => setPassenger({ ...passenger, name: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="ct-input-group">
                <label className="ct-input-label">Age</label>
                <input className="ct-input-field" value={passenger.age} onChange={(e) => setPassenger({ ...passenger, age: e.target.value })} />
              </div>
              <div className="ct-input-group">
                <label className="ct-input-label">Gender</label>
                <select className="ct-select-field" value={passenger.gender} onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="ct-input-group">
                <label className="ct-input-label">Berth Preference</label>
                <select className="ct-select-field" value={passenger.berthPref} onChange={(e) => setPassenger({ ...passenger, berthPref: e.target.value })}>
                  <option>Lower Berth (LB)</option>
                  <option>Middle Berth (MB)</option>
                  <option>Upper Berth (UB)</option>
                  <option>Side Lower (SL)</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#047857', fontSize: '0.9rem' }}>🛡️ Add Free Cancellation (@ ₹199)</strong>
                <p style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.2rem' }}>Get 100% full refund on cancellation (No IRCTC fee charged)</p>
              </div>
              <input type="checkbox" checked={freeCancellation} onChange={(e) => setFreeCancellation(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="ct-search-btn" style={{ background: '#94a3b8', margin: 0 }} onClick={() => setStep('berths')}>Back</button>
              <button className="ct-search-btn" style={{ margin: 0 }} onClick={handleConfirmReservation} disabled={loading}>
                {loading ? 'Confirming Ticket...' : `Pay ₹${2150 + (freeCancellation ? 199 : 0)} via ConfirmTkt UPI`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERS Ticket Modal */}
      {step === 'ers_ticket' && booking && payment && (
        <div className="ct-modal-bg">
          <div className="ct-modal-card" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ct-green)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="ct-logo-badge">confirmtkt</span>
                <span style={{ fontWeight: 800, color: 'var(--ct-navy)', marginLeft: '0.5rem' }}>Electronic Reservation Slip (ERS)</span>
              </div>
              <span style={{ color: 'var(--ct-green)', fontWeight: 900, fontSize: '1.1rem' }}>CNF (Confirmed)</span>
            </div>

            <div className="ct-ers-box">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p><strong>PNR Number:</strong> <span style={{ color: 'var(--ct-green)', fontWeight: 900 }}>{booking.pnr_number}</span></p>
                <p><strong>Train No & Name:</strong> 12951 / RAJDHANI EXP</p>
                <p><strong>Quota:</strong> TATKAL</p>
                <p><strong>Class:</strong> AC 3 Tier (3A)</p>
                <p><strong>From:</strong> NDLS (16:55)</p>
                <p><strong>To:</strong> MMCT (08:35)</p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--ct-border)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p><strong>Passenger:</strong> {passenger.name} ({passenger.age} yrs, {passenger.gender})</p>
                <p><strong>IRCTC User:</strong> {passenger.irctcUsername}</p>
                <p><strong>Booking Status:</strong> CNF / Coach B1 / Berth {selectedSeat?.seat_label}</p>
                <p><strong>Free Cancellation:</strong> {freeCancellation ? 'ENABLED (100% Refundable)' : 'DISABLED'}</p>
                <p><strong>Transaction Ref:</strong> {payment.provider_reference}</p>
                <p><strong>Total Fare Paid:</strong> ₹{booking.total_amount}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="ct-search-btn" style={{ margin: 0 }} onClick={() => { setStep('berths'); setActiveTab('home'); setSelectedSeat(null); setActiveHold(null); setBooking(null); setPayment(null); }}>
                Book Another Ticket on ConfirmTkt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmTkt Footer */}
      <footer className="ct-footer">
        <div className="ct-footer-grid">
          <div>
            <div className="ct-footer-title">Book</div>
            <ul className="ct-footer-list">
              <li><a href="https://www.confirmtkt.com/">IRCTC Tickets</a></li>
              <li><a href="https://www.ixigo.com/flights?utm_source=confirmtkt&utm_medium=desktop" target="_blank" rel="noreferrer">Flights</a></li>
              <li><a href="https://www.ixigo.com/hotels?utm_source=confirmtkt&utm_medium=desktop" target="_blank" rel="noreferrer">Hotels</a></li>
              <li><a href="https://www.confirmtkt.com/order-food-on-train">Order Food on Train</a></li>
            </ul>
          </div>
          <div>
            <div className="ct-footer-title">Features</div>
            <ul className="ct-footer-list">
              <li><a href="https://www.confirmtkt.com/pnr-status">PNR Status</a></li>
              <li><a href="https://www.confirmtkt.com/train-running-status">Train Running Status</a></li>
              <li><a href="https://www.confirmtkt.com/train-schedule">Train Schedule</a></li>
              <li><a href="https://www.confirmtkt.com/irctc-aadhaar-link">IRCTC Aadhaar Link</a></li>
            </ul>
          </div>
          <div>
            <div className="ct-footer-title">About ConfirmTkt</div>
            <ul className="ct-footer-list">
              <li><a href="https://www.confirmtkt.com/contact.htm">Contact Us</a></li>
              <li><a href="https://www.confirmtkt.com/MediaKit.zip">Media Kit</a></li>
              <li><a href="https://docs.google.com/forms/d/1rAepQbj02vTSI0JB9vC1GVrkQcboIUmKBrfT78dqVXo/viewform?ts=57d7aac1" target="_blank" rel="noreferrer">Alliances</a></li>
            </ul>
          </div>
          <div>
            <div className="ct-footer-title">Partners</div>
            <ul className="ct-footer-list">
              <li><a href="https://www.ixigo.com/" target="_blank" rel="noreferrer">ixigo</a></li>
              <li><a href="https://www.abhibus.com/" target="_blank" rel="noreferrer">abhibus</a></li>
            </ul>
          </div>
          <div>
            <div className="ct-footer-title">Legal</div>
            <ul className="ct-footer-list">
              <li><a href="https://www.confirmtkt.com/privacypolicy.htm">Privacy Policy</a></li>
              <li><a href="https://www.confirmtkt.com/termscondition.html">Terms & Conditions</a></li>
              <li><a href="https://www.confirmtkt.com/alternate-travel-plan">Alternate Travel Plan</a></li>
            </ul>
          </div>
        </div>

        <div className="ct-footer-bottom">
          Confirmtkt.com is official partner of IRCTC to book IRCTC train tickets and Railway train enquiry.<br/>
          © Copyright @ Le Travenues Technology Ltd. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
