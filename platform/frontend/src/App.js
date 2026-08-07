import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [activeHold, setActiveHold] = useState(null);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('berths'); // 'berths' | 'passenger_modal' | 'confirmation'
  const [activeClass, setActiveClass] = useState('3A');
  const [passenger, setPassenger] = useState({ name: 'Rahul Sharma', age: '29', gender: 'Male' });

  // Auto-login default passenger
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'passenger@irctc.com',
          password: 'UserPassword123!'
        });
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
      } catch (err) {
        try {
          const regRes = await axios.post(`${API_BASE}/auth/register`, {
            email: 'passenger@irctc.com',
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

  // Fetch Train & Berth Data
  const fetchTrainData = async () => {
    try {
      setLoading(true);
      const eventRes = await axios.get(`${API_BASE}/events`);
      if (eventRes.data.length > 0) {
        const trainRoute = eventRes.data[0];
        setEvent(trainRoute);

        const seatsRes = await axios.get(`${API_BASE}/events/${trainRoute.id}/seats`);
        setSeats(seatsRes.data);
      }
    } catch (err) {
      setError('Cannot connect to TicketForge Backend. Ensure Express server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainData();
  }, []);

  // Claim Berth Hold (5-Min Redis TTL)
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
      fetchTrainData();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message || 'Berth is currently held by another passenger!');
      } else {
        setError('Failed to claim berth hold.');
      }
    }
  };

  // Open Passenger Detail Modal
  const handleOpenCheckout = () => {
    if (!selectedSeat || !activeHold) return;
    setStep('passenger_modal');
  };

  // Confirm Ticket & Pay
  const handleConfirmAndPay = async () => {
    if (!selectedSeat || !activeHold || !event) return;
    setError('');
    setLoading(true);

    const idempotencyKey = `tatkal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // 1. Create Booking
      const bookingRes = await axios.post(
        `${API_BASE}/bookings`,
        { event_id: event.id, seat_ids: [selectedSeat.id] },
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
      setStep('confirmation');
      fetchTrainData();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* IRCTC / Trainline Inspired Header */}
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">🚆</span>
          TicketForge Express
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
            ⚡ Tatkal Surge Open
          </span>
          {user && <span style={{ fontSize: '0.9rem', color: '#e0e7ff', fontWeight: 600 }}>👤 {user.name}</span>}
        </div>
      </header>

      <div className="page-container">
        {error && (
          <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Route Card */}
        {event && (
          <div className="card train-header-card">
            <div>
              <div className="train-title">
                {event.title}
                <span className="badge-tatkal">Tatkal Quota</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Runs Daily | Superfast Express | Dynamic Availability
              </p>

              <div className="route-timeline">
                <div className="station-box">
                  <span className="station-time">16:55</span>
                  <span className="station-name">New Delhi (NDLS)</span>
                </div>
                <div className="route-arrow">
                  <span>15h 40m • Direct</span>
                  <div className="route-line"></div>
                </div>
                <div className="station-box">
                  <span className="station-time">08:35</span>
                  <span className="station-name">Mumbai Central (MMCT)</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary-dark)' }}>₹2,150</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '700' }}>✓ Instant Tatkal Confirmation</span>
            </div>
          </div>
        )}

        {/* Class Selection Tabs */}
        <div className="class-tabs">
          <div className={`class-tab ${activeClass === '3A' ? 'active' : ''}`} onClick={() => setActiveClass('3A')}>
            <span>AC 3-Tier (3A)</span>
            <small>₹2,150</small>
          </div>
          <div className={`class-tab ${activeClass === '2A' ? 'active' : ''}`} onClick={() => setActiveClass('2A')}>
            <span>AC 2-Tier (2A)</span>
            <small>₹3,100</small>
          </div>
          <div className={`class-tab ${activeClass === '1A' ? 'active' : ''}`} onClick={() => setActiveClass('1A')}>
            <span>AC 1st Class (1A)</span>
            <small>₹4,850</small>
          </div>
          <div className={`class-tab ${activeClass === 'SL' ? 'active' : ''}`} onClick={() => setActiveClass('SL')}>
            <span>Sleeper (SL)</span>
            <small>₹650</small>
          </div>
        </div>

        {/* Coach Layout & Berth Selection Grid */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Coach B1 Berth Selector (Select 1 Berth)
            </h3>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>🟢 Available</span>
              <span>🟡 Held (5-Min Lock)</span>
              <span>🔴 Booked</span>
            </div>
          </div>

          <div className="berth-grid">
            {seats.map((seat) => {
              const isSelected = selectedSeat?.id === seat.id;
              return (
                <div
                  key={seat.id}
                  className={`berth-card ${seat.status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleHoldBerth(seat)}
                >
                  <div className="berth-num">{seat.seat_label.split(' ')[0]}</div>
                  <div className="berth-type">{seat.seat_label.split(' ')[1] || 'LB'}</div>
                </div>
              );
            })}
          </div>

          {/* Active Hold Bar */}
          {activeHold && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>🔒 Berth Reserved!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  Berth <strong>{selectedSeat?.seat_label}</strong> locked in Redis until <strong>{new Date(activeHold.expires_at).toLocaleTimeString()}</strong>.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleOpenCheckout}>
                Book Berth & Pay ₹2,150 →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Passenger Details & Payment Modal */}
      {step === 'passenger_modal' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
              Passenger Details & Payment
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Passenger Name</label>
              <input
                type="text"
                className="card"
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem' }}
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Age</label>
                  <input
                    type="text"
                    className="card"
                    style={{ width: '100%', padding: '0.75rem' }}
                    value={passenger.age}
                    onChange={(e) => setPassenger({ ...passenger, age: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Gender</label>
                  <select className="card" style={{ width: '100%', padding: '0.75rem' }}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <p><strong>Train:</strong> 12951 | Rajdhani Express</p>
              <p><strong>Selected Berth:</strong> {selectedSeat?.seat_label}</p>
              <p><strong>Fare Amount:</strong> ₹2,150.00</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: '#f3f4f6' }} onClick={() => setStep('berths')}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmAndPay} disabled={loading}>
                {loading ? 'Confirming Ticket...' : 'Confirm Tatkal Ticket (Pay ₹2,150)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Slip Modal */}
      {step === 'confirmation' && payment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', color: 'var(--accent-green)' }}>✅</div>
            <h2 style={{ color: 'var(--primary-dark)', margin: '0.5rem 0' }}>Ticket Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Electronic Reservation Slip (ERS)</p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', margin: '1.25rem 0', textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}><strong>PNR Number:</strong> 284-9876541</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}><strong>Passenger:</strong> {passenger.name} ({passenger.age} yrs, Male)</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}><strong>Coach / Berth:</strong> Coach B1, Berth {selectedSeat?.seat_label}</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}><strong>Transaction Ref:</strong> {payment.provider_reference}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: '700' }}><strong>Status:</strong> CNF (Confirmed Tatkal)</p>
            </div>

            <button className="btn btn-primary" onClick={() => {
              setStep('berths');
              setSelectedSeat(null);
              setActiveHold(null);
              setBooking(null);
              setPayment(null);
            }}>
              Book Another Berth
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
