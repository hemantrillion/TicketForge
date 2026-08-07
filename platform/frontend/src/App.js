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
  const [step, setStep] = useState('seats'); // 'seats' | 'checkout' | 'confirmation'

  // Seed / Login default demo user
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'demo@ticketforge.com',
          password: 'UserPassword123!'
        });
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
      } catch (err) {
        // Register if not exists
        try {
          const regRes = await axios.post(`${API_BASE}/auth/register`, {
            email: 'demo@ticketforge.com',
            password: 'UserPassword123!',
            name: 'Demo Ticket Buyer'
          });
          setUser(regRes.data.user);
          setToken(regRes.data.token);
          localStorage.setItem('token', regRes.data.token);
        } catch (regErr) {
          console.error('Auto login/register failed:', regErr);
        }
      }
    };
    autoLogin();
  }, []);

  // Fetch Event & Seats
  const fetchEventData = async () => {
    try {
      setLoading(true);
      const eventRes = await axios.get(`${API_BASE}/events`);
      if (eventRes.data.length > 0) {
        const currentEvent = eventRes.data[0];
        setEvent(currentEvent);
        
        const seatsRes = await axios.get(`${API_BASE}/events/${currentEvent.id}/seats`);
        setSeats(seatsRes.data);
      }
    } catch (err) {
      setError('Failed to connect to TicketForge Backend. Ensure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  // Hold Seat
  const handleHoldSeat = async (seat) => {
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
      fetchEventData();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message || 'Seat already held by another user!');
      } else {
        setError('Failed to claim seat hold.');
      }
    }
  };

  // Proceed to Checkout & Book
  const handleProceedToCheckout = async () => {
    if (!selectedSeat || !activeHold) return;
    setError('');
    setLoading(true);

    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const res = await axios.post(
        `${API_BASE}/bookings`,
        { event_id: event.id, seat_ids: [selectedSeat.id] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );
      setBooking(res.data.booking || res.data);
      setStep('checkout');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  // Pay Mock
  const handlePayMock = async () => {
    if (!booking) return;
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/payments`,
        {
          booking_id: booking.booking_id || booking.id,
          amount: booking.total_amount,
          card_token: 'tok_visa_success'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayment(res.data);
      setStep('confirmation');
      fetchEventData();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">TicketForge</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="badge badge-phase0">Phase 0: Control Group</span>
          {user && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 {user.name}</span>}
        </div>
      </header>

      {error && (
        <div className="alert-box alert-error">
          ⚠️ {error}
        </div>
      )}

      {event && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{event.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>📍 {event.venue_name} | 🕒 {new Date(event.starts_at).toLocaleString()}</p>
        </div>
      )}

      {step === 'seats' && (
        <div className="card">
          <div className="stage-banner">STAGE / PERFORMANCE PLATFORM</div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Select an available seat to hold inventory for 5 minutes.
          </p>

          <div className="seat-grid">
            {seats.map((seat) => (
              <button
                key={seat.id}
                className={`seat-btn ${seat.status} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                onClick={() => handleHoldSeat(seat)}
                disabled={seat.status === 'booked' || (seat.status === 'held' && selectedSeat?.id !== seat.id)}
              >
                {seat.seat_label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            <span>🟢 Available ($150)</span>
            <span>🟠 Held (TTL)</span>
            <span>🔴 Booked</span>
          </div>

          {activeHold && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
              <h3>Seat Hold Active!</h3>
              <p style={{ margin: '0.5rem 0' }}>Seat <strong>{selectedSeat?.seat_label}</strong> reserved until: {new Date(activeHold.expires_at).toLocaleTimeString()}</p>
              <button className="btn btn-primary" onClick={handleProceedToCheckout} disabled={loading}>
                {loading ? 'Processing...' : 'Proceed to Checkout →'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'checkout' && booking && (
        <div className="card">
          <h2>Checkout & Payment Confirmation</h2>
          <div style={{ margin: '1.5rem 0', lineHeight: '1.8' }}>
            <p><strong>Booking ID:</strong> {booking.booking_id || booking.id}</p>
            <p><strong>Seat:</strong> {selectedSeat?.seat_label} (VIP Section)</p>
            <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
            <p><strong>Idempotency Key:</strong> <code style={{ fontSize: '0.8rem' }}>{booking.idempotency_key}</code></p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handlePayMock} disabled={loading}>
              {loading ? 'Processing Payment...' : '💳 Pay $150.00 (Mock Card)'}
            </button>
            <button className="btn btn-secondary" onClick={() => setStep('seats')}>
              ← Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'confirmation' && payment && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'var(--accent-green)' }}>Booking Confirmed!</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
            Your payment was successfully processed under Phase 0 control logic.
          </p>

          <div className="alert-box alert-success" style={{ justifyContent: 'center' }}>
            Payment Reference: <strong>{payment.provider_reference}</strong>
          </div>

          <button className="btn btn-secondary" onClick={() => {
            setStep('seats');
            setSelectedSeat(null);
            setActiveHold(null);
            setBooking(null);
            setPayment(null);
          }}>
            Return to Seat Map
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
