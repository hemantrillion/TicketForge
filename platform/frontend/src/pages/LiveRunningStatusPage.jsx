import React, { useState } from 'react';
import { useSimulationClock } from '../context/SimulationClockContext';
import { TRAIN_SCHEDULES } from '../data/schedules';

export default function LiveRunningStatusPage() {
  const { simDate } = useSimulationClock();
  const [trainQuery, setTrainQuery] = useState('12951');
  const [selectedTrain, setSelectedTrain] = useState(TRAIN_SCHEDULES['12951']);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = TRAIN_SCHEDULES[trainQuery.trim()];
    if (found) setSelectedTrain(found);
    else setSelectedTrain(TRAIN_SCHEDULES['12951']);
  };

  // Calculate Live Train Position Based on Sim-Clock Hour
  const simHour = simDate.getHours();
  let currentStatusText = 'Departed NDLS - On Time';
  let activeSeq = 2;

  if (simHour >= 6 && simHour < 12) {
    currentStatusText = 'Passed Kota Jn - Running On Time';
    activeSeq = 3;
  } else if (simHour >= 12 && simHour < 18) {
    currentStatusText = 'Approaching Vadodara Jn (Platform 1)';
    activeSeq = 4;
  } else if (simHour >= 18) {
    currentStatusText = 'Arrived at Destination Mumbai Central';
    activeSeq = 7;
  }

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* SEARCH BANNER */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Live Train Running Status</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Real-time location tracker driven by Accelerated Simulation Clock.</p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
            <input
              className="ct-form-input"
              style={{ maxWidth: '400px' }}
              placeholder="Enter Train Number (e.g. 12951, 22436, 12002)"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
            />
            <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }}>
              CHECK STATUS
            </button>
          </form>
        </div>

        {/* LIVE STATUS BANNER & TIMELINE */}
        {selectedTrain && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 800 }}>LIVE LOCATION TRACKER (SIM TIME: {simDate.toLocaleTimeString()})</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#065f46', marginTop: '0.2rem' }}>{currentStatusText}</div>
              </div>
              <span style={{ background: '#3aa459', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
                ON TIME
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
              {selectedTrain.number} - {selectedTrain.name}
            </div>

            {/* LIVE STATION TIMELINE TRACK */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '3px', background: '#cbd5e1' }} />
              {selectedTrain.stoppages.map(st => {
                const isPassed = st.seq <= activeSeq;
                const isCurrent = st.seq === activeSeq;

                return (
                  <div key={st.seq} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      background: isCurrent ? '#ea580c' : (isPassed ? '#3aa459' : '#cbd5e1'),
                      border: '2px solid #ffffff'
                    }} />

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isCurrent ? '#ea580c' : '#0f172a' }}>
                        {st.stationName} ({st.stationCode})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {st.pf} • {st.distanceKm} km
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                        Dept: {st.dept}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isPassed ? '#3aa459' : '#94a3b8', fontWeight: 700 }}>
                        {isPassed ? 'Passed' : 'Upcoming'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
