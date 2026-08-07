import React from 'react';

const POPULAR_STATIONS = [
  { code: 'NDLS', name: 'NDLS - New Delhi', city: 'New Delhi - Delhi' },
  { code: 'MMCT', name: 'MMCT - Mumbai Central', city: 'Mumbai - Maharashtra' },
  { code: 'HWH', name: 'HWH - Howrah Jn', city: 'Kolkata - West Bengal' },
  { code: 'SBC', name: 'SBC - KSR Bengaluru', city: 'Bengaluru - Karnataka' },
  { code: 'MAS', name: 'MAS - Chennai Central', city: 'Chennai - Tamil Nadu' }
];

export default function StationDropdownModal({ onSelectStation }) {
  return (
    <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
      <input className="ct-dropdown-input" placeholder="Search for a station/city" autoFocus />
      <div className="ct-dropdown-section-title">Popular Searches</div>
      {POPULAR_STATIONS.map(st => (
        <div key={st.code} className="ct-station-item" onClick={() => onSelectStation(st.name)}>
          <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
          <div>
            <div className="ct-station-code">{st.name}</div>
            <div className="ct-station-city">{st.city}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
