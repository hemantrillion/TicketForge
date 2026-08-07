import React, { useState } from 'react';

const DUMMY_TRAINS = [
  {
    id: '12951',
    number: '12951',
    name: 'MUMBAI RAJDHANI EXP',
    days: 'M T W T F S S',
    deptTime: '16:55',
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '15h 40m',
    arrTime: '08:35',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: '3A', status: 'AVAILABLE - 0042', cnf: 'CNF 98% High Chance', price: 2150, color: '#3aa459' },
      { code: '2A', status: 'AVAILABLE - 0018', cnf: 'CNF 100% High Chance', price: 3105, color: '#3aa459' },
      { code: '1A', status: 'AVAILABLE - 0006', cnf: 'CNF 100% High Chance', price: 4950, color: '#3aa459' },
      { code: 'SL', status: 'NOT AVAILABLE', cnf: 'Low Chance', price: 780, color: '#dc2626' }
    ]
  },
  {
    id: '22436',
    number: '22436',
    name: 'VANDE BHARAT EXPRESS',
    days: 'M T W T F S -',
    deptTime: '06:00',
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '12h 15m',
    arrTime: '18:15',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: 'CC', status: 'AVAILABLE - 0084', cnf: 'CNF 99% High Chance', price: 1850, color: '#3aa459' },
      { code: 'EC', status: 'AVAILABLE - 0012', cnf: 'CNF 100% High Chance', price: 3520, color: '#3aa459' }
    ]
  },
  {
    id: '12002',
    number: '12002',
    name: 'SHATABDI EXPRESS',
    days: 'M T W T F S S',
    deptTime: '06:15',
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '11h 50m',
    arrTime: '18:05',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: '3A', status: 'WL 04', cnf: 'CNF 78% Medium Chance', price: 1980, color: '#d97706' },
      { code: '2A', status: 'AVAILABLE - 0009', cnf: 'CNF 95% High Chance', price: 2890, color: '#3aa459' },
      { code: 'SL', status: 'WL 18', cnf: 'CNF 45% Low Chance', price: 650, color: '#dc2626' }
    ]
  },
  {
    id: '12626',
    number: '12626',
    name: 'KERALA EXPRESS',
    days: 'M T W T F S S',
    deptTime: '20:10',
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '18h 30m',
    arrTime: '14:40',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: 'SL', status: 'AVAILABLE - 0120', cnf: 'CNF 100% High Chance', price: 610, color: '#3aa459' },
      { code: '3A', status: 'AVAILABLE - 0035', cnf: 'CNF 96% High Chance', price: 1650, color: '#3aa459' },
      { code: '2A', status: 'WL 02', cnf: 'CNF 88% High Chance', price: 2420, color: '#d97706' }
    ]
  }
];

export default function SearchResultsPage({ fromStation, toStation, displayDateStr, onSelectClassForBooking, onBackToHome }) {
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

  const filteredTrains = DUMMY_TRAINS.filter(train => {
    if (filterAcOnly) {
      const hasAc = train.classes.some(c => ['3A', '2A', '1A', 'CC', 'EC'].includes(c.code));
      if (!hasAc) return false;
    }
    if (filterAvailableOnly) {
      const hasAvail = train.classes.some(c => c.status.startsWith('AVAILABLE'));
      if (!hasAvail) return false;
    }
    return true;
  });

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* SEARCH TOP HEADER BAR */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', sticky: 'top', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onBackToHome} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            ← Modify Search
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {fromStation} ➔ {toStation}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {displayDateStr} • {filteredTrains.length} Trains Found
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Quota:</span>
          {['GENERAL', 'TATKAL', 'LADIES'].map(q => (
            <button
              key={q}
              onClick={() => setSelectedQuota(q)}
              style={{
                background: selectedQuota === q ? '#3aa459' : '#f1f5f9',
                color: selectedQuota === q ? '#ffffff' : '#334155',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '1.5rem auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', padding: '0 1rem' }}>
        {/* LEFT FILTER SIDEBAR */}
        <aside style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Filters</h3>
          
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
            {['Early Morning (00:00 - 06:00)', 'Morning (06:00 - 12:00)', 'Afternoon (12:00 - 18:00)', 'Night (18:00 - 24:00)'].map(t => (
              <button key={t} style={{ display: 'block', width: '100%', textAling: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '0.35rem', cursor: 'pointer', textAlign: 'left' }}>
                {t}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT TRAIN LISTINGS */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTrains.map(train => (
            <div key={train.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {/* TRAIN TITLE ROW */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{train.number} - {train.name}</span>
                  <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>Runs: {train.days}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>SUPERFAST • GUARANTEED REFUND</span>
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
                {train.classes.map(cls => (
                  <div key={cls.code} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cls.code}</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{cls.price}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: cls.color, marginBottom: '0.25rem' }}>
                        {cls.status}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                        {cls.cnf}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectClassForBooking(train, cls)}
                      style={{
                        marginTop: '0.75rem',
                        background: cls.status.startsWith('AVAILABLE') ? '#3aa459' : '#e2e8f0',
                        color: cls.status.startsWith('AVAILABLE') ? '#ffffff' : '#64748b',
                        border: 'none',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: cls.status.startsWith('AVAILABLE') ? 'pointer' : 'not-allowed',
                        width: '100%'
                      }}
                    >
                      {cls.status.startsWith('AVAILABLE') ? 'BOOK' : 'NOT AVAIL'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
