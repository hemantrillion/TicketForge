import React, { useState } from 'react';
import { useSimulationClock } from '../context/SimulationClockContext';

const DUMMY_TRAINS = [
  {
    id: '22436',
    number: '22436',
    name: 'VANDE BHARAT EXPRESS',
    category: 'PREMIUM SEMI-HIGH SPEED',
    categoryColor: '#7c3aed',
    days: 'M T W T F S -',
    deptTime: '06:00',
    deptHour: 6,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '12h 15m',
    arrTime: '18:15',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 84, 2: 20, 1: 10 },
    classes: [
      { code: 'CC', price: 1850 },
      { code: 'EC', price: 3520 }
    ]
  },
  {
    id: '12002',
    number: '12002',
    name: 'SHATABDI EXPRESS',
    category: 'PREMIUM EXPRESS',
    categoryColor: '#0284c7',
    days: 'M T W T F S S',
    deptTime: '06:15',
    deptHour: 6,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '11h 50m',
    arrTime: '18:05',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 45, 2: 12, 1: 5 },
    classes: [
      { code: '3A', price: 1980 },
      { code: '2A', price: 2890 },
      { code: 'SL', price: 650 }
    ]
  },
  {
    id: '12953',
    number: '12953',
    name: 'AUGUST KRANTI RAJDHANI',
    category: 'PREMIUM EXPRESS',
    categoryColor: '#0284c7',
    days: 'M T W T F S S',
    deptTime: '07:55',
    deptHour: 7,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '16h 05m',
    arrTime: '00:00',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 38, 2: 14, 1: 4 },
    classes: [
      { code: '3A', price: 2180 },
      { code: '2A', price: 3150 },
      { code: '1A', price: 4980 }
    ]
  },
  {
    id: '12472',
    number: '12472',
    name: 'SWARAJ EXPRESS',
    category: 'SUPERFAST EXPRESS',
    categoryColor: '#2563eb',
    days: '- T W - F S -',
    deptTime: '08:40',
    deptHour: 8,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '21h 30m',
    arrTime: '06:10',
    arrStation: 'BDTS',
    arrCity: 'Mumbai Bandra',
    baseAvail: { 3: 95, 2: 42, 1: 10 },
    classes: [
      { code: 'SL', price: 680 },
      { code: '3A', price: 1780 },
      { code: '2A', price: 2560 }
    ]
  },
  {
    id: '12926',
    number: '12926',
    name: 'PASCHIM EXPRESS',
    category: 'MAIL / EXPRESS',
    categoryColor: '#475569',
    days: 'M T W T F S S',
    deptTime: '10:00',
    deptHour: 10,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '23h 25m',
    arrTime: '09:25',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 110, 2: 50, 1: 12 },
    classes: [
      { code: 'SL', price: 640 },
      { code: '3A', price: 1710 },
      { code: '2A', price: 2480 }
    ]
  },
  {
    id: '12951',
    number: '12951',
    name: 'MUMBAI RAJDHANI EXP',
    category: 'PREMIUM EXPRESS',
    categoryColor: '#0284c7',
    days: 'M T W T F S S',
    deptTime: '16:55',
    deptHour: 16,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '15h 40m',
    arrTime: '08:35',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 42, 2: 18, 1: 6 },
    classes: [
      { code: '3A', price: 2150 },
      { code: '2A', price: 3105 },
      { code: '1A', price: 4950 }
    ]
  },
  {
    id: '12626',
    number: '12626',
    name: 'KERALA EXPRESS',
    category: 'SUPERFAST EXPRESS',
    categoryColor: '#2563eb',
    days: 'M T W T F S S',
    deptTime: '20:10',
    deptHour: 20,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '18h 30m',
    arrTime: '14:40',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    baseAvail: { 3: 120, 2: 35, 1: 10 },
    classes: [
      { code: 'SL', price: 610 },
      { code: '3A', price: 1650 },
      { code: '2A', price: 2420 }
    ]
  }
];

export default function SearchResultsPage({ fromStation, toStation, displayDateStr, onSelectClassForBooking, onBackToHome }) {
  const { simDate } = useSimulationClock();
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');

  // SIMULATION DISCREPANCY FIX: FORMAT SIM-CLOCK DATE FOR RESULTS HEADER
  const simDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const simMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeSimDateStr = `${simDayNames[simDate.getDay()]}, ${simDate.getDate().toString().padStart(2, '0')} ${simMonthNames[simDate.getMonth()]}`;

  // DYNAMIC SEAT BOOKING SIMULATION DRIVEN BY SIM-CLOCK ACCELERATION
  // Calculates seat count depletion as Sim Time advances
  const getDynamicSeatStatus = (train, clsCode) => {
    const baseCount = (train.baseAvail && train.baseAvail[3]) ? train.baseAvail[3] : 42;
    // Calculate sim hours elapsed from 09 Aug baseline
    const baseTime = new Date(2026, 7, 9, 6, 0, 0).getTime();
    const currentSimTime = simDate.getTime();
    const simHoursElapsed = Math.max(0, (currentSimTime - baseTime) / (1000 * 60 * 60));

    // Dynamic depletion calculation (2-4 seats per sim-hour depending on train multiplier)
    const seatsBooked = Math.floor(simHoursElapsed * 2.5);
    const currentAvail = baseCount - seatsBooked;

    if (currentAvail > 0) {
      return { status: `AVAILABLE - ${currentAvail.toString().padStart(4, '0')}`, cnf: 'CNF 100% High Chance', color: '#3aa459', avail: true };
    } else if (currentAvail >= -15) {
      return { status: `WL ${Math.abs(currentAvail) + 1}`, cnf: 'CNF 75% Medium Chance', color: '#d97706', avail: false };
    } else {
      return { status: 'NOT AVAILABLE', cnf: 'Low Chance', color: '#dc2626', avail: false };
    }
  };

  const filteredTrains = DUMMY_TRAINS.map(train => {
    const matchingClasses = train.classes.filter(c => {
      if (filterAcOnly && !['3A', '2A', '1A', 'CC', 'EC'].includes(c.code)) {
        return false;
      }
      const dynamicStat = getDynamicSeatStatus(train, c.code);
      if (filterAvailableOnly && !dynamicStat.avail) {
        return false;
      }
      return true;
    });

    return {
      ...train,
      visibleClasses: matchingClasses
    };
  }).filter(train => {
    if (train.visibleClasses.length === 0) return false;

    // Check if train has already departed under Sim Time!
    const simHour = simDate.getHours();
    // If sim date has passed train's departure date/hour, train has left!
    if (simDate.getDate() > 9 && train.deptHour < simHour) {
      // Train departed!
    }

    if (filterTimeSlot === 'EARLY' && !(train.deptHour >= 0 && train.deptHour < 6)) return false;
    if (filterTimeSlot === 'MORNING' && !(train.deptHour >= 6 && train.deptHour < 12)) return false;
    if (filterTimeSlot === 'AFTERNOON' && !(train.deptHour >= 12 && train.deptHour < 18)) return false;
    if (filterTimeSlot === 'NIGHT' && !(train.deptHour >= 18 && train.deptHour < 24)) return false;

    return true;
  });

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* SEARCH TOP HEADER BAR */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onBackToHome} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            ← Back to Search
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {fromStation} ➔ {toStation}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Sim Date: <strong style={{ color: '#0284c7' }}>{activeSimDateStr}</strong> • {filteredTrains.length} Trains Found
            </div>
          </div>
        </div>

        {/* QUOTA SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Quota:</span>
          {[
            { id: 'GENERAL', label: 'GENERAL' },
            { id: 'TATKAL', label: 'TATKAL' },
            { id: 'LADIES', label: 'LADIES' }
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQuota(q.id)}
              style={{
                background: selectedQuota === q.id ? (q.id === 'TATKAL' ? '#ea580c' : '#3aa459') : '#f1f5f9',
                color: selectedQuota === q.id ? '#ffffff' : '#334155',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: selectedQuota === q.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '1.5rem auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', padding: '0 1rem' }}>
        {/* LEFT FILTER SIDEBAR */}
        <aside style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Filters</h3>
            {(filterAcOnly || filterAvailableOnly || filterTimeSlot !== 'ALL') && (
              <span
                onClick={() => { setFilterAcOnly(false); setFilterAvailableOnly(false); setFilterTimeSlot('ALL'); }}
                style={{ fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
              >
                Reset All
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Quick Filters</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAcOnly} onChange={(e) => setFilterAcOnly(e.target.checked)} />
              AC Classes Only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAvailableOnly} onChange={(e) => setFilterAvailableOnly(e.target.checked)} />
              Available Seats Only
            </label>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Departure Time</div>
            {[
              { id: 'ALL', label: 'All Times' },
              { id: 'EARLY', label: 'Early Morning (00:00 - 06:00)' },
              { id: 'MORNING', label: 'Morning (06:00 - 12:00)' },
              { id: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
              { id: 'NIGHT', label: 'Night (18:00 - 24:00)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterTimeSlot(t.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  background: filterTimeSlot === t.id ? '#ecfdf5' : '#f8fafc',
                  color: filterTimeSlot === t.id ? '#065f46' : '#334155',
                  border: filterTimeSlot === t.id ? '1px solid #3aa459' : '1px solid #e2e8f0',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: filterTimeSlot === t.id ? 800 : 500
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT TRAIN LISTINGS */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTrains.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>No Trains Match Your Filters</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Try clearing your filters or selecting a different departure time slot.</p>
              <button
                onClick={() => { setFilterAcOnly(false); setFilterAvailableOnly(false); setFilterTimeSlot('ALL'); }}
                style={{ marginTop: '1rem', background: '#3aa459', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTrains.map(train => (
              <div key={train.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* TRAIN TITLE ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{train.number} - {train.name}</span>
                    <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>Runs: {train.days}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: train.categoryColor, background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800 }}>
                      {train.category}
                    </span>
                  </div>
                </div>

                {/* ROUTE TIMELINE ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{train.deptTime}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{train.deptStation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{train.deptCity}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{train.duration}</div>
                    <div style={{ height: '2px', background: '#cbd5e1', margin: '0.25rem 0', position: 'relative' }}>
                      <div style={{ width: '8px', height: '8px', background: '#3aa459', borderRadius: '50%', position: 'absolute', top: '-3px', left: '50%', transform: 'translateX(-50%)' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Direct</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{train.arrTime}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{train.arrStation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{train.arrCity}</div>
                  </div>
                </div>

                {/* CLASS MATRIX ROW (DYNAMICALLY UPDATING SEATS BASED ON ACCELERATED SIM-CLOCK) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {train.visibleClasses.map(cls => {
                    const dynStat = getDynamicSeatStatus(train, cls.code);
                    const price = selectedQuota === 'TATKAL' ? cls.price + 350 : cls.price;

                    return (
                      <div key={cls.code} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cls.code}</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{price}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: dynStat.color, marginBottom: '0.25rem' }}>
                            {dynStat.status}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                            {dynStat.cnf}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectClassForBooking(train, { ...cls, price })}
                          style={{
                            marginTop: '0.75rem',
                            background: dynStat.avail ? '#3aa459' : '#e2e8f0',
                            color: dynStat.avail ? '#ffffff' : '#64748b',
                            border: 'none',
                            padding: '0.45rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: dynStat.avail ? 'pointer' : 'not-allowed',
                            width: '100%'
                          }}
                        >
                          {dynStat.avail ? 'BOOK' : 'NOT AVAIL'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
