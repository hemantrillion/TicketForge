import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// GENERATE REALISTIC BAY DATA FOR 3A / SL (72 BERTHS - 9 BAYS OF 8 BERTHS)
const GENERATE_3A_BAYS = () => {
  const bays = [];
  for (let b = 0; b < 9; b++) {
    const start = b * 8;
    bays.push({
      bayNum: b + 1,
      mainLeft: [
        { id: start + 1, num: start + 1, type: 'LB', isOccupied: [5, 12, 27, 44, 60].includes(start + 1) },
        { id: start + 2, num: start + 2, type: 'MB', isOccupied: [6, 18, 45].includes(start + 2) },
        { id: start + 3, num: start + 3, type: 'UB', isOccupied: [19, 27].includes(start + 3) }
      ],
      mainRight: [
        { id: start + 4, num: start + 4, type: 'LB', isOccupied: [4, 20, 36, 52].includes(start + 4) },
        { id: start + 5, num: start + 5, type: 'MB', isOccupied: [13, 29, 53].includes(start + 5) },
        { id: start + 6, num: start + 6, type: 'UB', isOccupied: [14, 30, 54].includes(start + 6) }
      ],
      sideCorridor: [
        { id: start + 7, num: start + 7, type: 'SL', isOccupied: [7, 15, 31, 47, 63].includes(start + 7) },
        { id: start + 8, num: start + 8, type: 'SU', isOccupied: [8, 16, 32, 48, 64].includes(start + 8) }
      ]
    });
  }
  return bays;
};

// GENERATE REALISTIC BAY DATA FOR 2A (54 BERTHS - NO MIDDLE BERTHS - 9 BAYS OF 6 BERTHS)
const GENERATE_2A_BAYS = () => {
  const bays = [];
  for (let b = 0; b < 9; b++) {
    const start = b * 6;
    bays.push({
      bayNum: b + 1,
      mainLeft: [
        { id: start + 1, num: start + 1, type: 'LB', isOccupied: [1, 7, 19].includes(start + 1) },
        { id: start + 2, num: start + 2, type: 'UB', isOccupied: [2, 14, 26].includes(start + 2) }
      ],
      mainRight: [
        { id: start + 3, num: start + 3, type: 'LB', isOccupied: [3, 15, 27].includes(start + 3) },
        { id: start + 4, num: start + 4, type: 'UB', isOccupied: [4, 16, 28].includes(start + 4) }
      ],
      sideCorridor: [
        { id: start + 5, num: start + 5, type: 'SL', isOccupied: [5, 17, 29].includes(start + 5) },
        { id: start + 6, num: start + 6, type: 'SU', isOccupied: [6, 18, 30].includes(start + 6) }
      ]
    });
  }
  return bays;
};

export default function CoachSeatPage({ train, selectedClass, fromStation, toStation, displayDateStr, onBackToResults, user }) {
  const classCode = selectedClass ? selectedClass.code : '3A';
  
  // COACH LIST BY CLASS
  const availableCoaches = classCode.startsWith('2A')
    ? ['A1', 'A2', 'A3']
    : (classCode.startsWith('1A') ? ['H1'] : (classCode.startsWith('SL') ? ['S1', 'S2', 'S3', 'S4', 'S5'] : ['B1', 'B2', 'B3', 'B4', 'B5']));

  const [activeCoach, setActiveCoach] = useState(availableCoaches[0]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Form & Ticket State
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [irctcUser, setIrctcUser] = useState('irctc_user_2026');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male', berthPref: 'Lower' }]);
  const [optFreeCancel, setOptFreeCancel] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // 5-Minute Timer
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleSeat = (seatObj) => {
    const seatKey = `${activeCoach}-${seatObj.id}`;
    const exists = selectedSeats.some(s => `${s.coach}-${s.id}` === seatKey);

    if (exists) {
      setSelectedSeats(selectedSeats.filter(s => `${s.coach}-${s.id}` !== seatKey));
    } else {
      if (selectedSeats.length < passengerCount) {
        setSelectedSeats([...selectedSeats, { coach: activeCoach, ...seatObj }]);
      }
    }
  };

  const handlePassengerCountChange = (count) => {
    setPassengerCount(count);
    setSelectedSeats([]);
    const newPass = Array.from({ length: count }, (_, i) => passengers[i] || { name: '', age: '', gender: 'Male', berthPref: 'Lower' });
    setPassengers(newPass);
  };

  const handlePassengerInputChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleFinalBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    const seatDesc = selectedSeats.map((s, idx) => `${s.coach}-${s.num} (${s.type})`).join(', ');

    try {
      const res = await axios.post(`${API_BASE}/bookings`, {
        user_id: user ? user.id : 1,
        event_id: train ? parseInt(train.id) : 101,
        seat_ids: selectedSeats.map(s => s.id),
        passenger_name: passengers[0].name || 'Rahul Sharma',
        passenger_age: parseInt(passengers[0].age) || 28
      });

      setGeneratedTicket({
        pnr: res.data.pnr || `284-${Math.floor(1000000 + Math.random() * 9000000)}`,
        trainName: train ? train.name : 'MUMBAI RAJDHANI EXP',
        trainNumber: train ? train.number : '12951',
        fromStation,
        toStation,
        displayDateStr,
        seats: seatDesc || `${activeCoach}-12 (LB)`,
        passengerName: passengers[0].name || 'Rahul Sharma',
        amountPaid: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150
      });

      setShowPaymentModal(false);
      setShowPassengerModal(false);
    } catch (err) {
      setGeneratedTicket({
        pnr: `284-${Math.floor(1000000 + Math.random() * 9000000)}`,
        trainName: train ? train.name : 'MUMBAI RAJDHANI EXP',
        trainNumber: train ? train.number : '12951',
        fromStation,
        toStation,
        displayDateStr,
        seats: seatDesc || `${activeCoach}-12 (LB)`,
        passengerName: passengers[0].name || 'Rahul Sharma',
        amountPaid: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150
      });
      setShowPaymentModal(false);
      setShowPassengerModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const basePrice = selectedClass ? selectedClass.price : 2150;
  const totalPrice = basePrice * passengerCount + (optFreeCancel ? 199 * passengerCount : 0);

  const baysData = classCode.startsWith('2A') ? GENERATE_2A_BAYS() : GENERATE_3A_BAYS();

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* HEADER BAR */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={onBackToResults} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ← Back to Trains
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
            {train ? train.number : '12951'} {train ? train.name : 'MUMBAI RAJDHANI EXP'} ({classCode})
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {fromStation} ➔ {toStation} • {displayDateStr}
          </div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 800 }}>SEAT HOLD LOCK EXPIRING IN</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>{formatTimer(timerSeconds)}</div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem' }}>
        {/* PASSENGER COUNTER & MULTI-COACH SELECTOR BAR */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Passengers ({passengerCount}) & Coach Selection</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Select coach and berths. You can pick seats across different coaches.</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Passengers:</span>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handlePassengerCountChange(num)}
                  style={{
                    background: passengerCount === num ? '#3aa459' : '#f1f5f9',
                    color: passengerCount === num ? '#ffffff' : '#334155',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Coach:</span>
              {availableCoaches.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCoach(c)}
                  style={{
                    background: activeCoach === c ? '#0f172a' : '#e2e8f0',
                    color: activeCoach === c ? '#ffffff' : '#334155',
                    border: 'none',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REALISTIC PHYSICAL COACH BAY DIAGRAM */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Coach {activeCoach} Physical Layout ({classCode} - {classCode.startsWith('2A') ? 'No Middle Berths' : '3-Tier Bay'})
            </h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#ffffff', border: '2px solid #3aa459', borderRadius: '3px' }} /> Available</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#3aa459', borderRadius: '3px' }} /> Selected</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#cbd5e1', borderRadius: '3px' }} /> Occupied</span>
            </div>
          </div>

          {/* REALISTIC COMPARTMENT BAYS WITH AISLE AND SIDE CORRIDOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {baysData.map(bay => (
              <div key={bay.bayNum} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem' }}>BAY {bay.bayNum}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 140px', gap: '1rem', alignItems: 'center' }}>
                  {/* MAIN COMPARTMENT (LEFT & RIGHT FACING COLUMNS) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {/* LEFT FACING COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {bay.mainLeft.map(seat => {
                        const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                        return (
                          <button
                            key={seat.id}
                            disabled={seat.isOccupied}
                            onClick={() => handleToggleSeat(seat)}
                            style={{
                              background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                              color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                              border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                              borderRadius: '6px',
                              padding: '0.35rem 0.5rem',
                              display: 'flex',
                              justify: 'space-between',
                              alignItems: 'center',
                              cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* RIGHT FACING COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {bay.mainRight.map(seat => {
                        const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                        return (
                          <button
                            key={seat.id}
                            disabled={seat.isOccupied}
                            onClick={() => handleToggleSeat(seat)}
                            style={{
                              background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                              color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                              border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                              borderRadius: '6px',
                              padding: '0.35rem 0.5rem',
                              display: 'flex',
                              justify: 'space-between',
                              alignItems: 'center',
                              cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CENTER WALKING AISLE (TEXT ONLY - ZERO EMOJIS) */}
                  <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>
                    AISLE
                  </div>

                  {/* SIDE CORRIDOR (SIDE LOWER & SIDE UPPER) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {bay.sideCorridor.map(seat => {
                      const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isOccupied}
                          onClick={() => handleToggleSeat(seat)}
                          style={{
                            background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                            color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                            border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Selected Berths ({selectedSeats.length}/{passengerCount}):</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
              {selectedSeats.length > 0
                ? selectedSeats.map(s => `${s.coach}-${s.num} (${s.type})`).join(', ')
                : 'None Selected'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Total Base Fare</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#3aa459' }}>₹{basePrice * passengerCount}</div>
            </div>

            <button
              onClick={() => setShowPassengerModal(true)}
              style={{
                background: '#3aa459',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Proceed to Passenger Details →
            </button>
          </div>
        </div>
      </div>

      {/* PASSENGER DETAILS MODAL */}
      {showPassengerModal && (
        <div className="ct-modal-bg" onClick={() => setShowPassengerModal(false)}>
          <div className="ct-auth-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="ct-auth-title">Passenger Details & IRCTC Login</h2>
            <p className="ct-auth-sub">Enter passenger details to complete booking.</p>

            <form onSubmit={(e) => { e.preventDefault(); setShowPaymentModal(true); }}>
              <div className="ct-input-group">
                <label className="ct-input-label">IRCTC Username</label>
                <input className="ct-form-input" required value={irctcUser} onChange={(e) => setIrctcUser(e.target.value)} placeholder="Enter IRCTC User ID" />
              </div>

              {passengers.map((p, idx) => {
                const assignedSeat = selectedSeats[idx] ? `${selectedSeats[idx].coach}-${selectedSeats[idx].num} (${selectedSeats[idx].type})` : `Unassigned`;
                return (
                  <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>Passenger {idx + 1}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3aa459' }}>Seat: {assignedSeat}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input className="ct-form-input" required placeholder="Full Name" value={p.name} onChange={(e) => handlePassengerInputChange(idx, 'name', e.target.value)} />
                      <input className="ct-form-input" required placeholder="Age" type="number" value={p.age} onChange={(e) => handlePassengerInputChange(idx, 'age', e.target.value)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <select className="ct-form-input" value={p.gender} onChange={(e) => handlePassengerInputChange(idx, 'gender', e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <select className="ct-form-input" value={p.berthPref} onChange={(e) => handlePassengerInputChange(idx, 'berthPref', e.target.value)}>
                        <option value="Lower">Lower Berth</option>
                        <option value="Middle">Middle Berth</option>
                        <option value="Upper">Upper Berth</option>
                        <option value="Side Lower">Side Lower</option>
                      </select>
                    </div>
                  </div>
                );
              })}

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>Free Cancellation Protection</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>Get 100% full refund on cancellation</div>
                </div>
                <input type="checkbox" checked={optFreeCancel} onChange={(e) => setOptFreeCancel(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>Total Fare Payable:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#3aa459' }}>₹{totalPrice}</span>
              </div>

              <button type="submit" className="ct-auth-submit">
                Proceed to Payment Gateway →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMTKT UPI PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="ct-modal-bg">
          <div className="ct-auth-modal" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="ct-auth-title">ConfirmTkt UPI Payment</h2>
            <p className="ct-auth-sub">Select your UPI provider to authorize booking.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.5rem 0' }}>
              {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map(upi => (
                <button
                  key={upi}
                  onClick={handleFinalBookingSubmit}
                  disabled={bookingLoading}
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #3aa459',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  {upi}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinalBookingSubmit}
              disabled={bookingLoading}
              className="ct-auth-submit"
            >
              {bookingLoading ? 'Processing Reservation...' : `Pay ₹${totalPrice} & Generate Ticket`}
            </button>
          </div>
        </div>
      )}

      {/* ERS TICKET CONFIRMATION SLIP MODAL */}
      {generatedTicket && (
        <div className="ct-modal-bg">
          <div className="ct-auth-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
              ✓ BOOKING CONFIRMED - ELECTRONIC RESERVATION SLIP (ERS)
            </div>

            <div style={{ border: '2px solid #3aa459', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PNR NUMBER</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3aa459', letterSpacing: '1px' }}>{generatedTicket.pnr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TRAIN DETAILS</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{generatedTicket.trainNumber} - {generatedTicket.trainName}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <div><strong>Route:</strong> {generatedTicket.fromStation} ➔ {generatedTicket.toStation}</div>
                <div><strong>Date:</strong> {generatedTicket.displayDateStr}</div>
                <div><strong>Passenger:</strong> {generatedTicket.passengerName}</div>
                <div><strong>Seats Assigned:</strong> {generatedTicket.seats}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
                Status: <span style={{ color: '#3aa459' }}>CONFIRMED (CNF)</span> • Charting Status: <span style={{ color: '#2563eb' }}>CHART NOT PREPARED</span>
              </div>
            </div>

            <button
              onClick={() => { setGeneratedTicket(null); onBackToResults(); }}
              className="ct-auth-submit"
            >
              Done & Return to Train Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
