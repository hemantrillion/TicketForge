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
  const [step, setStep] = useState('trains'); // 'trains' | 'passenger_modal' | 'payment_modal' | 'ers_ticket'
  
  // Search Form State
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [quota, setQuota] = useState('TATKAL');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [passenger, setPassenger] = useState({ name: 'Rahul Sharma', age: '29', gender: 'Male', berthPref: 'Lower (LB)', mealPref: 'Veg' });

  // Auto Login Default IRCTC Account
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'passenger@irctc.co.in',
          password: 'UserPassword123!'
        });
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
      } catch (err) {
        try {
          const regRes = await axios.post(`${API_BASE}/auth/register`, {
            email: 'passenger@irctc.co.in',
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
    } catch (err) {
      setError('Cannot connect to IRCTC Backend. Ensure Express server is running on port 5000.');
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

  // Submit Reservation & Process Payment
  const handleConfirmReservation = async () => {
    if (!selectedSeat || !activeHold || !selectedEvent) return;
    setError('');
    setLoading(true);

    const idempotencyKey = `tatkal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // 1. Create Booking with PNR
      const bookingRes = await axios.post(
        `${API_BASE}/bookings`,
        {
          event_id: selectedEvent.id,
          seat_ids: [selectedSeat.id],
          passenger_name: passenger.name,
          passenger_age: parseInt(passenger.age),
          passenger_gender: passenger.gender
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

      // 2. Submit Payment via IRCTC iPay
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

  return (
    <div>
      {/* Official IRCTC Header */}
      <header className="top-header">
        <div className="brand-container">
          <span className="irctc-logo-badge">IRCTC</span>
          <span className="brand-title">NextGen eTicketing System</span>
        </div>
        <div className="top-nav-links">
          <span className="top-nav-item">🚆 TRAINS</span>
          <span className="top-nav-item">📋 PNR STATUS</span>
          <span className="top-nav-item">📊 CHARTS / VACANCY</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
            💬 AskDISHA 2.0 AI
          </span>
          {user && <span style={{ color: 'var(--irctc-orange)', fontWeight: 800 }}>👤 {user.name}</span>}
        </div>
      </header>

      <div className="main-container">
        {error && (
          <div className="train-card" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: 'var(--irctc-red)', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* IRCTC Train Search Bar */}
        <div className="search-widget">
          <div className="form-group">
            <label className="form-label">From Station</label>
            <input className="form-input" value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">To Station</label>
            <input className="form-input" value={toStation} onChange={(e) => setToStation(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Journey Date</label>
            <input className="form-input" type="date" defaultValue="2026-09-01" />
          </div>
          <div className="form-group">
            <label className="form-label">Quota</label>
            <select className="form-select" value={quota} onChange={(e) => setQuota(e.target.value)}>
              <option value="TATKAL">⚡ TATKAL (Open 10:00 AM)</option>
              <option value="GENERAL">GENERAL</option>
              <option value="PREMIUM TATKAL">PREMIUM TATKAL</option>
              <option value="LADIES">LADIES</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="3A">AC 3-Tier (3A)</option>
              <option value="2A">AC 2-Tier (2A)</option>
              <option value="1A">AC 1st Class (1A)</option>
              <option value="SL">Sleeper (SL)</option>
            </select>
          </div>
          <button className="btn-irctc" onClick={fetchTrains}>Modify Search</button>
        </div>

        {/* Train Search Results List */}
        {events.map((evt) => {
          const isSelected = selectedEvent?.id === evt.id;
          return (
            <div key={evt.id} className={`train-card ${isSelected ? 'active' : ''}`} onClick={() => { setSelectedEvent(evt); fetchBerths(evt.id); }}>
              <div className="train-header">
                <div className="train-name">
                  🚆 {evt.title}
                  <span className="tatkal-badge">⚡ Tatkal Quota Active</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--irctc-green)', fontWeight: 800 }}>
                  ✓ 100% Confirmation Probability
                </span>
              </div>

              <div className="schedule-row">
                <div className="time-box">
                  <span className="time-big">16:55</span>
                  <span className="station-sub">New Delhi (NDLS)</span>
                </div>
                <div className="duration-line">
                  15h 40m • Direct
                </div>
                <div className="time-box">
                  <span className="time-big">08:35</span>
                  <span className="station-sub">Mumbai Central (MMCT)</span>
                </div>
              </div>

              <div className="availability-grid">
                <div className={`avail-pill ${selectedClass === '3A' ? 'selected' : ''}`}>
                  <span className="class-title">AC 3-Tier (3A)</span>
                  <span className="status-badge status-green">AVAILABLE-0042</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.25rem' }}>₹2,150</span>
                </div>
                <div className="avail-pill">
                  <span className="class-title">AC 2-Tier (2A)</span>
                  <span className="status-badge status-orange">RAC-12</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.25rem' }}>₹3,100</span>
                </div>
                <div className="avail-pill">
                  <span className="class-title">AC 1st Class (1A)</span>
                  <span className="status-badge status-green">AVAILABLE-0008</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.25rem' }}>₹4,850</span>
                </div>
                <div className="avail-pill">
                  <span className="class-title">Sleeper (SL)</span>
                  <span className="status-badge status-green">AVAILABLE-0110</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.25rem' }}>₹650</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Coach Layout & Berth Map Diagram */}
        {selectedEvent && (
          <div className="coach-section">
            <div className="coach-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--irctc-blue)', fontWeight: 800 }}>
                  Coach B1 Berth Arrangement Diagram (72 Berths)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--irctc-text-muted)', marginTop: '0.2rem' }}>
                  Click an available berth to lock it for 5 minutes (Redis SETNX lock active).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>🟢 Available</span>
                <span>🟡 Held (5-Min Redis Lock)</span>
                <span>🔴 Booked</span>
              </div>
            </div>

            <div className="berths-grid">
              {seats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                return (
                  <div
                    key={seat.id}
                    className={`berth-box ${seat.status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleHoldBerth(seat)}
                  >
                    <div className="berth-no">{seat.seat_label.split(' ')[1] || seat.seat_label}</div>
                    <div className="berth-tag">{seat.berth_type}</div>
                  </div>
                );
              })}
            </div>

            {/* Active Seat Lock Banner */}
            {activeHold && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--irctc-green)', fontSize: '1.05rem', fontWeight: 800 }}>
                    🔒 Berth Lock Active (Redis TTL: 300s)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '0.2rem' }}>
                    Berth <strong>{selectedSeat?.seat_label}</strong> reserved until <strong>{new Date(activeHold.expires_at).toLocaleTimeString()}</strong>.
                  </p>
                </div>
                <button className="btn-irctc" onClick={() => setStep('passenger_modal')}>
                  Book Selected Berth & Continue →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Passenger Details Drawer Modal */}
      {step === 'passenger_modal' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ color: 'var(--irctc-blue)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>
              Passenger Details Entry
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Passenger Full Name</label>
              <input
                className="form-input"
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  className="form-input"
                  value={passenger.age}
                  onChange={(e) => setPassenger({ ...passenger, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={passenger.gender} onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Transgender</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Berth Preference</label>
                <select className="form-select" value={passenger.berthPref} onChange={(e) => setPassenger({ ...passenger, berthPref: e.target.value })}>
                  <option>Lower (LB)</option>
                  <option>Middle (MB)</option>
                  <option>Upper (UB)</option>
                  <option>Side Lower (SL)</option>
                  <option>Side Upper (SU)</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--irctc-border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <p><strong>Train:</strong> 12951 | RAJDHANI EXPRESS</p>
              <p><strong>Coach & Berth:</strong> Coach B1, {selectedSeat?.seat_label}</p>
              <p><strong>Total Fare:</strong> ₹2,150.00 (Base: ₹1,800 + Tatkal: ₹300 + GST: ₹50)</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-blue" style={{ background: '#94a3b8' }} onClick={() => setStep('trains')}>
                Back
              </button>
              <button className="btn-irctc" onClick={handleConfirmReservation} disabled={loading}>
                {loading ? 'Processing IRCTC Payment...' : 'Pay ₹2,150 via IRCTC iPay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Electronic Reservation Slip (ERS Ticket Modal) */}
      {step === 'ers_ticket' && booking && payment && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--irctc-blue)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="irctc-logo-badge">IRCTC</span>
                <span style={{ fontWeight: 800, color: 'var(--irctc-blue)', marginLeft: '0.5rem' }}>Electronic Reservation Slip (ERS)</span>
              </div>
              <span style={{ color: 'var(--irctc-green)', fontWeight: 900, fontSize: '1.1rem' }}>CNF (Confirmed)</span>
            </div>

            <div className="ers-ticket">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p><strong>PNR Number:</strong> <span style={{ color: 'var(--irctc-blue)', fontWeight: 900 }}>{booking.pnr_number}</span></p>
                <p><strong>Train No & Name:</strong> 12951 / RAJDHANI EXP</p>
                <p><strong>Quota:</strong> TATKAL</p>
                <p><strong>Class:</strong> AC 3-Tier (3A)</p>
                <p><strong>From:</strong> NDLS (16:55)</p>
                <p><strong>To:</strong> MMCT (08:35)</p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--irctc-border)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <p><strong>Passenger:</strong> {passenger.name} ({passenger.age} yrs, {passenger.gender})</p>
                <p><strong>Booking Status:</strong> CNF / Coach B1 / Berth {selectedSeat?.seat_label}</p>
                <p><strong>Transaction Ref:</strong> {payment.provider_reference}</p>
                <p><strong>Total Fare Paid:</strong> ₹2,150.00</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn-irctc" onClick={() => {
                setStep('trains');
                setSelectedSeat(null);
                setActiveHold(null);
                setBooking(null);
                setPayment(null);
              }}>
                Book Another Tatkal Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
