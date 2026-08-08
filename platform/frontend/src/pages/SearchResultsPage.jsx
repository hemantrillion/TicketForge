import React, { useState, useEffect } from 'react';
import { useSimulationClock } from '../context/SimulationClockContext';
import { REAL_INDIAN_RAILWAYS_TRAINS } from '../data/real_trains';

export default function SearchResultsPage({ fromStation, toStation, selectedDate, onSelectClassForBooking, onBackToHome }) {
  const { simDate } = useSimulationClock();
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(true);
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');

  // JOURNEY DATE (B0) & SYSTEM TIME (A0) SEPARATION LOGIC
  // Initial journey date B0 from user search selection
  const [journeyDate, setJourneyDate] = useState(selectedDate || new Date(2026, 7, 15));

  // DYNAMIC ROLLOVER RULE (A0 >= B0):
  // When system simDate (A0) reaches or passes journeyDate (B0), automatically roll over B0 to track A0!
  useEffect(() => {
    if (!journeyDate) return;
    const simTimeMs = simDate.getTime();
    const journeyTimeMs = new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), 23, 59, 59).getTime();

    if (simTimeMs > journeyTimeMs) {
      // Roll over journey date B0 to current simDate A0
      setJourneyDate(new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate()));
    }
  }, [simDate, journeyDate]);

  const simDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const simMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeJourneyDateStr = `${simDayNames[journeyDate.getDay()]}, ${journeyDate.getDate().toString().padStart(2, '0')} ${simMonthNames[journeyDate.getMonth()]}`;

  // CHECK IF TRAIN RUNS ON THE JOURNEY DATE (B0) DAY OF WEEK
  const doesTrainRunToday = (trainDaysStr) => {
    if (!trainDaysStr) return true;
    const dayOfWeek = journeyDate.getDay();
    const dayIndexMap = [6, 0, 1, 2, 3, 4, 5];
    const targetIdx = dayIndexMap[dayOfWeek];

    const dayTokens = trainDaysStr.split(/\s+/);
    if (dayTokens.length >= 7) {
      return dayTokens[targetIdx] !== '-';
    }
    return true;
  };

  // CHECK IF TRAIN HAS DEPARTED RELATIVE TO SYSTEM TIME (A0) TODAY
  const isTrainDeparted = (train) => {
    // Only check departure if Journey Date B0 is the same day as System Time A0
    const isSameDay = simDate.getFullYear() === journeyDate.getFullYear() &&
                      simDate.getMonth() === journeyDate.getMonth() &&
                      simDate.getDate() === journeyDate.getDate();

    if (!isSameDay) return false; // Future travel date B0 has not departed!

    const simTimeMs = simDate.getTime();
    const trainDeptMs = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate(), train.deptHour, train.deptMin, 0).getTime();
    return simTimeMs > trainDeptMs;
  };

  // DYNAMIC SEAT BOOKING SIMULATION BASED ON DAYS TO DEPARTURE (B0 - A0)
  const getDynamicSeatStatus = (train, clsCode) => {
    if (isTrainDeparted(train)) {
      return { status: 'DEPARTED - BOOKING CLOSED', cnf: 'Departure Passed', color: '#dc2626', avail: false, departed: true };
    }

    const baseCount = (train.baseAvail && train.baseAvail[3]) ? train.baseAvail[3] : 42;
    
    // Calculate days to departure (B0 - A0)
    const journeyTimeMs = new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate()).getTime();
    const simTimeMs = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate()).getTime();
    const daysToDeparture = Math.max(0, Math.floor((journeyTimeMs - simTimeMs) / (1000 * 60 * 60 * 24)));

    // As A0 approaches B0 (daysToDeparture decreases), seat availability depletes
    const seatsBooked = Math.floor((30 - daysToDeparture) * 1.5);
    const currentAvail = Math.max(-15, baseCount - seatsBooked);

    if (currentAvail > 0) {
      return { status: `AVAILABLE - ${currentAvail.toString().padStart(4, '0')}`, cnf: 'CNF 100% High Chance', color: '#3aa459', avail: true, departed: false };
    } else if (currentAvail >= -15) {
      return { status: `WL ${Math.abs(currentAvail) + 1}`, cnf: 'CNF 75% Medium Chance', color: '#d97706', avail: false, departed: false };
    } else {
      return { status: 'NOT AVAILABLE', cnf: 'Low Chance', color: '#dc2626', avail: false, departed: false };
    }
  };

  const filteredTrains = REAL_INDIAN_RAILWAYS_TRAINS.map(train => {
    const runsToday = doesTrainRunToday(train.days);
    if (!runsToday) return null;

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
    if (!train || train.visibleClasses.length === 0) return false;

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
              Departure Date: <strong style={{ color: '#0284c7' }}>{activeJourneyDateStr}</strong> • {filteredTrains.length} Trains Available
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
            {(filterAcOnly || !filterAvailableOnly || filterTimeSlot !== 'ALL') && (
              <span
                onClick={() => { setFilterAcOnly(false); setFilterAvailableOnly(true); setFilterTimeSlot('ALL'); }}
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
                onClick={() => { setFilterAcOnly(false); setFilterAvailableOnly(true); setFilterTimeSlot('ALL'); }}
                style={{ marginTop: '1rem', background: '#3aa459', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTrains.map(train => {
              const departed = isTrainDeparted(train);
              return (
                <div key={train.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: departed ? '1px solid #fca5a5' : '1px solid #e2e8f0', opacity: departed ? 0.7 : 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {/* TRAIN TITLE ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{train.number} - {train.name}</span>
                      <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>Runs: {train.days}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {departed ? (
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800 }}>
                          DEPARTED - BOOKING CLOSED
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: train.categoryColor, background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800 }}>
                          {train.category}
                        </span>
                      )}
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

                  {/* CLASS MATRIX ROW */}
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
                            <div style={{ fontSize: '0.7rem', color: dynStat.departed ? '#dc2626' : '#059669', background: dynStat.departed ? '#fef2f2' : '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                              {dynStat.cnf}
                            </div>
                          </div>

                          <button
                            disabled={!dynStat.avail || dynStat.departed}
                            onClick={() => onSelectClassForBooking(train, { ...cls, price })}
                            style={{
                              marginTop: '0.75rem',
                              background: (dynStat.avail && !dynStat.departed) ? '#3aa459' : '#e2e8f0',
                              color: (dynStat.avail && !dynStat.departed) ? '#ffffff' : '#64748b',
                              border: 'none',
                              padding: '0.45rem',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: (dynStat.avail && !dynStat.departed) ? 'pointer' : 'not-allowed',
                              width: '100%'
                            }}
                          >
                            {(dynStat.avail && !dynStat.departed) ? 'BOOK' : (dynStat.departed ? 'DEPARTED' : 'NOT AVAIL')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
