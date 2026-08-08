import React, { useState } from 'react';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SimulationControlWidget() {
  const { simDate, simSpeed, setSimSpeed, isPaused, setIsPaused } = useSimulationClock();
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (d) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const hrs = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const secs = d.getSeconds().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hrs}:${mins}:${secs}`;
  };

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      {isOpen ? (
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '2px solid #334155', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: '#3b82f6', color: '#ffffff', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
              SIMULATION ENGINE
            </span>
            <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
              SIM TIME: <span style={{ color: '#38bdf8' }}>{formatDate(simDate)}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>SPEED:</span>
              {[1, 2, 6, 12, 24].map(s => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  style={{
                    background: simSpeed === s ? '#3aa459' : '#1e293b',
                    color: simSpeed === s ? '#ffffff' : '#94a3b8',
                    border: simSpeed === s ? '1px solid #3aa459' : '1px solid #475569',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}x {s === 24 ? '(1m=1d)' : ''}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: isPaused ? '#ea580c' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {isPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}
            </button>

            <button
              onClick={() => setIsOpen(false)}
              title="Hide Simulation Control Panel"
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '0.15rem 0.4rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              ▲ Slide Up
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', background: 'transparent', height: 0, position: 'relative' }}>
          <button
            onClick={() => setIsOpen(true)}
            title="Show Simulation Control Panel"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              padding: '0.25rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 1001
            }}
          >
            ▼ Simulation Control Panel
          </button>
        </div>
      )}
    </div>
  );
}
