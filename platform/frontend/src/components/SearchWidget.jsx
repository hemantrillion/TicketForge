import React from 'react';

const POPULAR_STATIONS = [
  { code: 'NDLS', name: 'NDLS - New Delhi', city: 'New Delhi - Delhi' },
  { code: 'MMCT', name: 'MMCT - Mumbai Central', city: 'Mumbai - Maharashtra' },
  { code: 'HWH', name: 'HWH - Howrah Jn', city: 'Kolkata - West Bengal' },
  { code: 'SBC', name: 'SBC - KSR Bengaluru', city: 'Bengaluru - Karnataka' },
  { code: 'MAS', name: 'MAS - Chennai Central', city: 'Chennai - Tamil Nadu' }
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SearchWidget({
  fromStation, setFromStation,
  toStation, setToStation,
  displayDateStr,
  showFromDropdown, setShowFromDropdown,
  showToDropdown, setShowToDropdown,
  showCalendar, setShowCalendar,
  calYear, calMonth,
  handlePrevMonth, handleNextMonth,
  handleSelectCalDate,
  firstDayIndex, daysInCalMonth,
  selectedDate,
  handleSwap,
  fetchTrains,
  searchContainerRef
}) {
  return (
    <section className="ct-hero-section">
      <h1 className="ct-hero-title">Train Ticket Booking</h1>
      <p className="ct-hero-subtitle">Easy IRCTC Login</p>

      <div className="ct-search-container" ref={searchContainerRef}>
        <div className="ct-search-box-left">
          {/* FROM FIELD */}
          <div className="ct-from-box" onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowCalendar(false); }}>
            <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
            <div className="ct-field-content">
              <span className="ct-field-label">From</span>
              <span className="ct-field-value">{fromStation}</span>
            </div>

            {showFromDropdown && (
              <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                <input className="ct-dropdown-input" placeholder="Search for a station/city" autoFocus />
                <div className="ct-dropdown-section-title">Popular Searches</div>
                {POPULAR_STATIONS.map(st => (
                  <div key={st.code} className="ct-station-item" onClick={() => { setFromStation(st.name); setShowFromDropdown(false); }}>
                    <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                    <div>
                      <div className="ct-station-code">{st.name}</div>
                      <div className="ct-station-city">{st.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON OVERLAPPING VERTICAL DIVIDER LINE PERFECTLY */}
          <div className="ct-swap-overlap-btn" onClick={handleSwap} title="Swap Stations">
            ⇄
          </div>

          {/* TO FIELD */}
          <div className="ct-to-box" onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowCalendar(false); }}>
            <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
            <div className="ct-field-content">
              <span className="ct-field-label">To</span>
              <span className="ct-field-value">{toStation}</span>
            </div>

            {showToDropdown && (
              <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
                <input className="ct-dropdown-input" placeholder="Search for a station/city" autoFocus />
                <div className="ct-dropdown-section-title">Popular Searches</div>
                {POPULAR_STATIONS.map(st => (
                  <div key={st.code} className="ct-station-item" onClick={() => { setToStation(st.name); setShowToDropdown(false); }}>
                    <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                    <div>
                      <div className="ct-station-code">{st.name}</div>
                      <div className="ct-station-city">{st.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: DEPARTURE DATE */}
        <div className="ct-search-box-right">
          <div className="ct-date-box" onClick={() => { setShowCalendar(!showCalendar); setShowFromDropdown(false); setShowToDropdown(false); }}>
            <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div className="ct-field-content">
              <span className="ct-field-label">Departure Date</span>
              <span className="ct-field-value">{displayDateStr}</span>
            </div>

            {showCalendar && (
              <div className="ct-calendar-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ct-cal-header">
                  <span className="ct-cal-nav" onClick={handlePrevMonth}>‹</span>
                  <span>{MONTH_NAMES[calMonth]} {calYear}</span>
                  <span className="ct-cal-nav" onClick={handleNextMonth}>›</span>
                </div>
                <div className="ct-cal-days">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="ct-cal-grid">
                  {[...Array(firstDayIndex)].map((_, i) => <div key={`blank-${i}`} />)}
                  {[...Array(daysInCalMonth)].map((_, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = selectedDate.getDate() === dayNum && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear;
                    return (
                      <div
                        key={dayNum}
                        className={`ct-cal-date ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectCalDate(dayNum)}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH CTA BUTTON */}
        <button className="ct-search-cta" onClick={fetchTrains}>SEARCH</button>
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <svg width="18" height="18" fill="#003366" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          IRCTC Authorised Partner
        </div>

        <div style={{ maxWidth: '650px', margin: '0 auto', background: '#1c1917', color: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
          <div>
            <span style={{ background: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INTRODUCING</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem', color: '#ffffff' }}>AI SEAT FINDER</h3>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Powered by TARA</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Find Confirmed Tickets Easily</h4>
            <button style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, marginTop: '0.5rem', cursor: 'pointer' }}>Download App</button>
          </div>
        </div>
      </div>
    </section>
  );
}
