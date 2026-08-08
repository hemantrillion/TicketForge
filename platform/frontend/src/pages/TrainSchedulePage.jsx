import React, { useState } from 'react';
import { TRAIN_SCHEDULES } from '../data/schedules';

export default function TrainSchedulePage() {
  const [trainQuery, setTrainQuery] = useState('12951');
  const [selectedTrain, setSelectedTrain] = useState(TRAIN_SCHEDULES['12951']);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = TRAIN_SCHEDULES[trainQuery.trim()];
    if (found) {
      setSelectedTrain(found);
    } else {
      // Default to 12951 Rajdhani if not found
      setSelectedTrain(TRAIN_SCHEDULES['12951']);
    }
  };

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* HEADER SEARCH BANNER */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>IRCTC Train Schedule & Timetable</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Check arrival, departure times, platform numbers, and stoppage distance in km.</p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
            <input
              className="ct-form-input"
              style={{ maxWidth: '400px' }}
              placeholder="Enter Train Number (e.g. 12951, 22436, 12002)"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
            />
            <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }}>
              GET SCHEDULE
            </button>
          </form>
        </div>

        {/* SCHEDULE RESULT CARD */}
        {selectedTrain && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{selectedTrain.number} - {selectedTrain.name}</span>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Route: {selectedTrain.from} ➔ {selectedTrain.to} • Runs On: <span style={{ fontWeight: 800, color: '#3aa459' }}>{selectedTrain.runsOn}</span>
                </div>
              </div>
              <span style={{ background: '#0284c7', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                {selectedTrain.type}
              </span>
            </div>

            {/* STOPPAGE TIMETABLE TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Station Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Arrive</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Depart</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Platform</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Distance</th>
                </tr>
              </thead>
              <tbody>
                {selectedTrain.stoppages.map(st => (
                  <tr key={st.seq} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#64748b' }}>{st.seq}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                      {st.stationName} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({st.stationCode})</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: st.arr === 'Source' ? '#3aa459' : '#0f172a' }}>{st.arr}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: st.dept === 'Destination' ? '#dc2626' : '#0f172a' }}>{st.dept}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2563eb', fontWeight: 700 }}>{st.pf}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{st.distanceKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
