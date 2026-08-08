import React, { useState } from 'react';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SimulationControlWidget() {
  const { simDate, simSpeed, setSimSpeed, isPaused, setIsPaused } = useSimulationClock();
  const [isOpen, setIsOpen] = useState(false);

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
    <div style={{ position: 'relative', zIndex: 2000 }}>
      {/* SLIDING HEADER PANEL (WHITE & GREEN THEME) */}
      <div style={{
        background: '#ffffff',
        borderBottom: '2px solid #a7f3d0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        padding: isOpen ? '0.65rem 2rem' : '0rem 2rem',
        maxHeight: isOpen ? '80px' : '0px',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            SIMULATION ENGINE
          </span>
          <span style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
            SIM TIME: <span style={{ color: '#059669', fontWeight: 900 }}>{formatDate(simDate)}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.8rem' }}>SPEED:</span>
            {[1, 2, 6, 12, 24].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                style={{
                  background: simSpeed === s ? '#3aa459' : '#f1f5f9',
                  color: simSpeed === s ? '#ffffff' : '#334155',
                  border: simSpeed === s ? '1px solid #27793e' : '1px solid #cbd5e1',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {s}x {s === 24 ? '(1m=1d)' : ''}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: isPaused ? '#ea580c' : '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '0.3rem 0.85rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}
          </button>
        </div>
      </div>

      {/* SINGLE CENTERED TOGGLE ARROW (SLIDES PANEL IN AND OUT) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Hide Simulation Header" : "Show Simulation Header"}
        style={{
          position: 'absolute',
          top: isOpen ? '100%' : '0',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          color: '#059669',
          border: '1px solid #a7f3d0',
          borderTop: 'none',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          padding: '0.25rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 2001,
          transition: 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {isOpen ? '▲' : '▼'}
      </button>
    </div>
  );
}
