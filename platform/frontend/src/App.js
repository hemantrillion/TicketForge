import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
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
  const [step, setStep] = useState('trains'); // 'trains' | 'passenger_modal' | 'ers_ticket'

  // ConfirmTkt Search Form State
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [quota, setQuota] = useState('TATKAL');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [freeCancellation, setFreeCancellation] = useState(true);
  const [passenger, setPassenger] = useState({
    name: 'Rahul Sharma',
    age: '29',
    gender: 'Male',
    berthPref: 'Lower Berth (LB)',
    irctcUsername: 'rahul_confirmtkt',
    mobile: '9876543210'
  });

  // Swap Stations Function
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Auto Login Default ConfirmTkt Account
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

  // Fetch ConfirmTkt Train List
  const fetchTrains = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/events`);
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]);
        fetchBerths(res.data[0].id);
      }
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

  // Claim Berth Hold (5-Min Redis Lock)
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

  // Submit ConfirmTkt Booking Transaction
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

      // 2. Process Payment via ConfirmTkt UPI
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
      setError(err.response?.data?.message || 'ConfirmTkt reservation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ConfirmTkt Top Header */}
      <header className="ct-navbar">
        <div className="ct-brand">
          <span className="ct-logo-badge">confirmtkt</span>
          <span className="ct-irctc-partner">
            🛡️ IRCTC Authorised Partner
          </span>
        </div>
        <div className="ct-nav-items">
          <span className="ct-nav-item active">🚆 Train Booking</span>
          <span className="ct-nav-item">📋 PNR Status</span>
          <span className="ct-nav-item">📍 Running Status</span>
          <span className="ct-nav-item">📈 CNF Predictor</span>
          <span style={{ background: 'rgba(0, 178, 89, 0.2)', color: 'var(--confirmtkt-green)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
            🛡️ Free Cancellation Active
          </span>
          {user && <span style={{ color: '#ffffff', fontWeight: 800 }}>👤 {user.name}</span>}
        </div>
      </header>

      <div className="ct-container">
        {error && (
          <div className="ct-train-card" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ConfirmTkt Hero Search Box */}
        <div className="ct-hero-box">
          <div className="ct-hero-title">
            <span>Book IRCTC Train Tickets with 100% Free Cancellation</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--confirmtkt-green)', fontWeight: 700 }}>⚡ Instant Refund to Bank Account</span>
          </div>

          <div className="ct-search-grid">
            <div className="ct-field">
              <label className="ct-label">From Station</label>
              <input className="ct-input" value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
            </div>

            <button className="ct-swap-btn" onClick={handleSwapStations}>⇄</button>

            <div className="ct-field">
              <label className="ct-label">To Station</label>
              <input className="ct-input" value={toStation} onChange={(e) => setToStation(e.target.value)} />
            </div>

            <div className="ct-field">
              <label className="ct-label">Journey Date</label>
              <input className="ct-input" type="date" defaultValue="2026-09-01" />
            </div>

            <div className="ct-field">
              <label className="ct-label">Quota</label>
              <select className="ct-select" value={quota} onChange={(e) => setQuota(e.target.value)}>
                <option value="TATKAL">⚡ TATKAL (10:00 AM Open)</option>
                <option value="GENERAL">GENERAL</option>
                <option value="PREMIUM TATKAL">PREMIUM TATKAL</option>
                <option value="LADIES">LADIES</option>
              </select>
            </div>

            <button className="ct-btn-search" onClick={fetchTrains}>SEARCH TRAINS</button>
          </div>
        </div>

        {/* ConfirmTkt Value Proposition Strip */}
        <div className="ct-value-bar">
          <div className="ct-value-card">
            <div className="ct-value-icon">🛡️</div>
            <div>
              <div className="ct-value-title">100% Free Cancellation</div>
              <div className="ct-value-desc">Full refund on cancellation</div>
            </div>
          </div>
          <div className="ct-value-card">
            <div className="ct-value-icon">📈</div>
            <div>
              <div className="ct-value-title">ConfirmTkt Predictor</div>
              <div className="ct-value-desc">AI Tatkal CNF chance score</div>
            </div>
          </div>
          <div className="ct-value-card">
            <div className="ct-value-icon">⚡</div>
            <div>
              <div className="ct-value-title">Instant Refunds</div>
              <div className="ct-value-desc">Direct to UPI / Bank Account</div>
            </div>
          </div>
          <div className="ct-value-card">
            <div className="ct-value-icon">📞</div>
            <div>
              <div className="ct-value-title">24x7 Customer Support</div>
              <div className="ct-value-desc">Dedicated booking assistance</div>
            </div>
          </div>
        </div>

        {/* ConfirmTkt Train Search Results */}
        {events.map((evt) => {
          const isSelected = selectedEvent?.id === evt.id;
          return (
            <div key={evt.id} className={`ct-train-card ${isSelected ? 'active' : ''}`} onClick={() => { setSelectedEvent(evt); fetchBerths(evt.id); }}>
              <div className="ct-train-title">
                <div>
                  🚆 {evt.title}
                  <div className="ct-runs-on">Runs On: M T W T F S S | Superfast Express</div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--confirmtkt-green)', fontWeight: 800 }}>
                  ✓ ConfirmTkt Verified Route
                </span>
              </div>

              <div className="ct-time-row">
                <div>
                  <span className="ct-time">16:55</span>
                  <div className="ct-station">New Delhi (NDLS)</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, color: 'var(--confirmtkt-green)', fontWeight: 800 }}>
                  15h 40m • Direct Route
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="ct-time">08:35</span>
                  <div className="ct-station">Mumbai Central (MMCT)</div>
                </div>
              </div>

              <div className="ct-matrix">
                <div className={`ct-matrix-card ${selectedClass === '3A' ? 'active' : ''}`}>
                  <span className="ct-matrix-class">3A (AC 3 Tier)</span>
                  <span className="ct-matrix-status ct-status-green">AVAILABLE - 0042</span>
                  <span className="ct-prediction">CNF 98% High Chance</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹2,150</span>
                </div>
                <div className="ct-matrix-card">
                  <span className="ct-matrix-class">2A (AC 2 Tier)</span>
                  <span className="ct-matrix-status ct-status-green">AVAILABLE - 0012</span>
                  <span className="ct-prediction">CNF 95% High Chance</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹3,100</span>
                </div>
                <div className="ct-matrix-card">
                  <span className="ct-matrix-class">1A (AC First)</span>
                  <span className="ct-matrix-status ct-status-orange">WL-04</span>
                  <span className="ct-prediction" style={{ background: '#fffbe6', color: '#b45309' }}>CNF 65% Medium</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹4,850</span>
                </div>
                <div className="ct-matrix-card">
                  <span className="ct-matrix-class">SL (Sleeper)</span>
                  <span className="ct-matrix-status ct-status-green">AVAILABLE - 0120</span>
                  <span className="ct-prediction">CNF 99% High Chance</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.35rem' }}>₹650</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Coach Layout & Berth Map Diagram */}
        {selectedEvent && (
          <div className="ct-coach-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--confirmtkt-navy)', fontWeight: 800 }}>
                  Coach B1 Berth Selection Grid (72 Berths)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--confirmtkt-text-muted)', marginTop: '0.2rem' }}>
                  Select an available berth to hold inventory for 5 minutes (Redis SETNX Lock Active).
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

            {/* Active Lock Bar */}
            {activeHold && (
              <div style={{ background: 'var(--confirmtkt-green-light)', border: '1.5px solid var(--confirmtkt-green)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--confirmtkt-green)', fontSize: '1.05rem', fontWeight: 900 }}>
                    🔒 Berth Locked in Redis (TTL: 300s)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--confirmtkt-navy)', marginTop: '0.25rem' }}>
                    Berth <strong>{selectedSeat?.seat_label}</strong> reserved until <strong>{new Date(activeHold.expires_at).toLocaleTimeString()}</strong>.
                  </p>
                </div>
                <button className="ct-btn-search" style={{ margin: 0, padding: '0.75rem 1.5rem' }} onClick={() => setStep('passenger_modal')}>
                  Book Selected Berth →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ConfirmTkt Passenger Entry Modal */}
      {step === 'passenger_modal' && (
        <div className="ct-modal-overlay">
          <div className="ct-modal">
            <h3 style={{ color: 'var(--confirmtkt-navy)', fontSize: '1.3rem', fontWeight: 900, marginBottom: '1rem' }}>
              ConfirmTkt Passenger Details
            </h3>

            <div className="ct-field" style={{ marginBottom: '1rem' }}>
              <label className="ct-label">IRCTC Username</label>
              <input
                className="ct-input"
                value={passenger.irctcUsername}
                onChange={(e) => setPassenger({ ...passenger, irctcUsername: e.target.value })}
              />
            </div>

            <div className="ct-field" style={{ marginBottom: '1rem' }}>
              <label className="ct-label">Passenger Name</label>
              <input
                className="ct-input"
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="ct-field">
                <label className="ct-label">Age</label>
                <input
                  className="ct-input"
                  value={passenger.age}
                  onChange={(e) => setPassenger({ ...passenger, age: e.target.value })}
                />
              </div>
              <div className="ct-field">
                <label className="ct-label">Gender</label>
                <select className="ct-select" value={passenger.gender} onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="ct-field">
                <label className="ct-label">Berth Preference</label>
                <select className="ct-select" value={passenger.berthPref} onChange={(e) => setPassenger({ ...passenger, berthPref: e.target.value })}>
                  <option>Lower Berth (LB)</option>
                  <option>Middle Berth (MB)</option>
                  <option>Upper Berth (UB)</option>
                  <option>Side Lower (SL)</option>
                  <option>Side Upper (SU)</option>
                </select>
              </div>
            </div>

            {/* Free Cancellation Toggle */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#047857', fontSize: '0.9rem' }}>🛡️ Add Free Cancellation (@ ₹199)</strong>
                <p style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.2rem' }}>Get 100% full refund on cancellation (No IRCTC fee charged)</p>
              </div>
              <input
                type="checkbox"
                checked={freeCancellation}
                onChange={(e) => setFreeCancellation(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="ct-btn-search" style={{ background: '#94a3b8', margin: 0 }} onClick={() => setStep('trains')}>
                Back
              </button>
              <button className="ct-btn-search" style={{ margin: 0 }} onClick={handleConfirmReservation} disabled={loading}>
                {loading ? 'Confirming Ticket...' : `Pay ₹${2150 + (freeCancellation ? 199 : 0)} via ConfirmTkt UPI`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmTkt ERS Ticket Confirmation Modal */}
      {step === 'ers_ticket' && booking && payment && (
        <div className="ct-modal-overlay">
          <div className="ct-modal" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--confirmtkt-green)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="ct-logo-badge">confirmtkt</span>
                <span style={{ fontWeight: 800, color: 'var(--confirmtkt-navy)', marginLeft: '0.5rem' }}>Electronic Reservation Slip (ERS)</span>
              </div>
              <span style={{ color: 'var(--confirmtkt-green)', fontWeight: 900, fontSize: '1.1rem' }}>CNF (Confirmed)</span>
            </div>

            <div className="ct-ers-box">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p><strong>PNR Number:</strong> <span style={{ color: 'var(--confirmtkt-green)', fontWeight: 900 }}>{booking.pnr_number}</span></p>
                <p><strong>Train No & Name:</strong> 12951 / RAJDHANI EXP</p>
                <p><strong>Quota:</strong> TATKAL</p>
                <p><strong>Class:</strong> AC 3 Tier (3A)</p>
                <p><strong>From:</strong> NDLS (16:55)</p>
                <p><strong>To:</strong> MMCT (08:35)</p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--confirmtkt-border)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p><strong>Passenger:</strong> {passenger.name} ({passenger.age} yrs, {passenger.gender})</p>
                <p><strong>IRCTC User:</strong> {passenger.irctcUsername}</p>
                <p><strong>Booking Status:</strong> CNF / Coach B1 / Berth {selectedSeat?.seat_label}</p>
                <p><strong>Free Cancellation Protection:</strong> {freeCancellation ? 'ENABLED (100% Refundable)' : 'DISABLED'}</p>
                <p><strong>Transaction Ref:</strong> {payment.provider_reference}</p>
                <p><strong>Total Fare Paid:</strong> ₹{booking.total_amount}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="ct-btn-search" style={{ margin: 0 }} onClick={() => {
                setStep('trains');
                setSelectedSeat(null);
                setActiveHold(null);
                setBooking(null);
                setPayment(null);
              }}>
                Book Another Ticket on ConfirmTkt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
