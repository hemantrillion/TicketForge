import React, { useState } from 'react';

const DUMMY_TRAINS = [
  {
    id: '12951',
    number: '12951',
    name: 'MUMBAI RAJDHANI EXP',
    days: 'M T W T F S S',
    deptTime: '16:55',
    deptHour: 16,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '15h 40m',
    arrTime: '08:35',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: '3A', generalStatus: 'AVAILABLE - 0042', tatkalStatus: 'TATKAL AVAILABLE - 0012', ladiesStatus: 'LADIES AVAILABLE - 0006', cnf: 'CNF 98% High Chance', price: 2150 },
      { code: '2A', generalStatus: 'AVAILABLE - 0018', tatkalStatus: 'TATKAL AVAILABLE - 0004', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 3105 },
      { code: '1A', generalStatus: 'AVAILABLE - 0006', tatkalStatus: 'TATKAL WL 01', ladiesStatus: 'LADIES WL 01', cnf: 'CNF 100% High Chance', price: 4950 },
      { code: 'SL', generalStatus: 'NOT AVAILABLE', tatkalStatus: 'NOT AVAILABLE', ladiesStatus: 'NOT AVAILABLE', cnf: 'Low Chance', price: 780 }
    ]
  },
  {
    id: '22436',
    number: '22436',
    name: 'VANDE BHARAT EXPRESS',
    days: 'M T W T F S -',
    deptTime: '06:00',
    deptHour: 6,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '12h 15m',
    arrTime: '18:15',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: 'CC', generalStatus: 'AVAILABLE - 0084', tatkalStatus: 'TATKAL AVAILABLE - 0020', ladiesStatus: 'LADIES AVAILABLE - 0010', cnf: 'CNF 99% High Chance', price: 1850 },
      { code: 'EC', generalStatus: 'AVAILABLE - 0012', tatkalStatus: 'TATKAL WL 02', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 3520 }
    ]
  },
  {
    id: '12002',
    number: '12002',
    name: 'SHATABDI EXPRESS',
    days: 'M T W T F S S',
    deptTime: '06:15',
    deptHour: 6,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '11h 50m',
    arrTime: '18:05',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: '3A', generalStatus: 'WL 04', tatkalStatus: 'TATKAL AVAILABLE - 0015', ladiesStatus: 'LADIES AVAILABLE - 0004', cnf: 'CNF 78% Medium Chance', price: 1980 },
      { code: '2A', generalStatus: 'AVAILABLE - 0009', tatkalStatus: 'TATKAL WL 03', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 95% High Chance', price: 2890 },
      { code: 'SL', generalStatus: 'WL 18', tatkalStatus: 'TATKAL WL 12', ladiesStatus: 'LADIES WL 05', cnf: 'CNF 45% Low Chance', price: 650 }
    ]
  },
  {
    id: '12626',
    number: '12626',
    name: 'KERALA EXPRESS',
    days: 'M T W T F S S',
    deptTime: '20:10',
    deptHour: 20,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '18h 30m',
    arrTime: '14:40',
    arrStation: 'MMCT',
    arrCity: 'Mumbai Central',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0120', tatkalStatus: 'TATKAL AVAILABLE - 0030', ladiesStatus: 'LADIES AVAILABLE - 0015', cnf: 'CNF 100% High Chance', price: 610 },
      { code: '3A', generalStatus: 'AVAILABLE - 0035', tatkalStatus: 'TATKAL AVAILABLE - 0010', ladiesStatus: 'LADIES AVAILABLE - 0005', cnf: 'CNF 96% High Chance', price: 1650 },
      { code: '2A', generalStatus: 'WL 02', tatkalStatus: 'TATKAL AVAILABLE - 0002', ladiesStatus: 'LADIES WL 01', cnf: 'CNF 88% High Chance', price: 2420 }
    ]
  },
  {
    id: '12259',
    number: '12259',
    name: 'SEALDAH DURONTO EXP',
    days: 'M - W T - S -',
    deptTime: '12:25',
    deptHour: 12,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '16h 55m',
    arrTime: '05:20',
    arrStation: 'HWH',
    arrCity: 'Howrah Jn',
    classes: [
      { code: '3A', generalStatus: 'AVAILABLE - 0055', tatkalStatus: 'TATKAL AVAILABLE - 0018', ladiesStatus: 'LADIES AVAILABLE - 0008', cnf: 'CNF 97% High Chance', price: 2240 },
      { code: '2A', generalStatus: 'AVAILABLE - 0022', tatkalStatus: 'TATKAL AVAILABLE - 0006', ladiesStatus: 'LADIES AVAILABLE - 0003', cnf: 'CNF 100% High Chance', price: 3210 },
      { code: '1A', generalStatus: 'AVAILABLE - 0008', tatkalStatus: 'TATKAL WL 01', ladiesStatus: 'LADIES WL 01', cnf: 'CNF 100% High Chance', price: 5120 }
    ]
  },
  {
    id: '12424',
    number: '12424',
    name: 'DIBRUGARH RAJDHANI',
    days: 'M T W T F S S',
    deptTime: '16:20',
    deptHour: 16,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '27h 40m',
    arrTime: '20:00',
    arrStation: 'GHY',
    arrCity: 'Guwahati',
    classes: [
      { code: '3A', generalStatus: 'AVAILABLE - 0064', tatkalStatus: 'TATKAL AVAILABLE - 0022', ladiesStatus: 'LADIES AVAILABLE - 0010', cnf: 'CNF 99% High Chance', price: 2980 },
      { code: '2A', generalStatus: 'AVAILABLE - 0014', tatkalStatus: 'TATKAL AVAILABLE - 0005', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 4120 }
    ]
  },
  {
    id: '12628',
    number: '12628',
    name: 'KARNATAKA EXPRESS',
    days: 'M T W T F S S',
    deptTime: '21:15',
    deptHour: 21,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '33h 45m',
    arrTime: '07:00',
    arrStation: 'SBC',
    arrCity: 'KSR Bengaluru',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0145', tatkalStatus: 'TATKAL AVAILABLE - 0040', ladiesStatus: 'LADIES AVAILABLE - 0020', cnf: 'CNF 100% High Chance', price: 790 },
      { code: '3A', generalStatus: 'AVAILABLE - 0048', tatkalStatus: 'TATKAL AVAILABLE - 0014', ladiesStatus: 'LADIES AVAILABLE - 0006', cnf: 'CNF 98% High Chance', price: 2080 },
      { code: '2A', generalStatus: 'AVAILABLE - 0012', tatkalStatus: 'TATKAL AVAILABLE - 0004', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 2990 }
    ]
  },
  {
    id: '12622',
    number: '12622',
    name: 'TAMIL NADU EXPRESS',
    days: 'M T W T F S S',
    deptTime: '22:30',
    deptHour: 22,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '32h 40m',
    arrTime: '07:10',
    arrStation: 'MAS',
    arrCity: 'Chennai Central',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0090', tatkalStatus: 'TATKAL AVAILABLE - 0025', ladiesStatus: 'LADIES AVAILABLE - 0012', cnf: 'CNF 100% High Chance', price: 760 },
      { code: '3A', generalStatus: 'AVAILABLE - 0038', tatkalStatus: 'TATKAL AVAILABLE - 0012', ladiesStatus: 'LADIES AVAILABLE - 0005', cnf: 'CNF 97% High Chance', price: 1980 },
      { code: '2A', generalStatus: 'AVAILABLE - 0010', tatkalStatus: 'TATKAL AVAILABLE - 0003', ladiesStatus: 'LADIES AVAILABLE - 0001', cnf: 'CNF 100% High Chance', price: 2850 }
    ]
  },
  {
    id: '12925',
    number: '12925',
    name: 'PASCHIM EXPRESS',
    days: 'M T W T F S S',
    deptTime: '11:05',
    deptHour: 11,
    deptStation: 'MMCT',
    deptCity: 'Mumbai Central',
    duration: '22h 30m',
    arrTime: '09:35',
    arrStation: 'NDLS',
    arrCity: 'New Delhi',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0110', tatkalStatus: 'TATKAL AVAILABLE - 0035', ladiesStatus: 'LADIES AVAILABLE - 0018', cnf: 'CNF 100% High Chance', price: 650 },
      { code: '3A', generalStatus: 'AVAILABLE - 0045', tatkalStatus: 'TATKAL AVAILABLE - 0015', ladiesStatus: 'LADIES AVAILABLE - 0007', cnf: 'CNF 98% High Chance', price: 1720 },
      { code: '2A', generalStatus: 'AVAILABLE - 0015', tatkalStatus: 'TATKAL AVAILABLE - 0005', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 2510 }
    ]
  },
  {
    id: '12137',
    number: '12137',
    name: 'PUNJAB MAIL',
    days: 'M T W T F S S',
    deptTime: '19:35',
    deptHour: 19,
    deptStation: 'CSMT',
    deptCity: 'Mumbai CSMT',
    duration: '30h 15m',
    arrTime: '01:50',
    arrStation: 'FZR',
    arrCity: 'Firozpur Cantt',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0130', tatkalStatus: 'TATKAL AVAILABLE - 0040', ladiesStatus: 'LADIES AVAILABLE - 0020', cnf: 'CNF 100% High Chance', price: 710 },
      { code: '3A', generalStatus: 'AVAILABLE - 0050', tatkalStatus: 'TATKAL AVAILABLE - 0018', ladiesStatus: 'LADIES AVAILABLE - 0008', cnf: 'CNF 99% High Chance', price: 1890 }
    ]
  },
  {
    id: '12802',
    number: '12802',
    name: 'PURUSHOTTAM EXPRESS',
    days: 'M T W T F S S',
    deptTime: '22:40',
    deptHour: 22,
    deptStation: 'NDLS',
    deptCity: 'New Delhi',
    duration: '30h 30m',
    arrTime: '05:10',
    arrStation: 'PURI',
    arrCity: 'Puri',
    classes: [
      { code: 'SL', generalStatus: 'AVAILABLE - 0080', tatkalStatus: 'TATKAL AVAILABLE - 0025', ladiesStatus: 'LADIES AVAILABLE - 0012', cnf: 'CNF 100% High Chance', price: 740 },
      { code: '3A', generalStatus: 'AVAILABLE - 0030', tatkalStatus: 'TATKAL AVAILABLE - 0010', ladiesStatus: 'LADIES AVAILABLE - 0004', cnf: 'CNF 96% High Chance', price: 1940 }
    ]
  },
  {
    id: '12432',
    number: '12432',
    name: 'TRIVANDRUM RAJDHANI',
    days: '- - W T - - S',
    deptTime: '06:15',
    deptHour: 6,
    deptStation: 'NZM',
    deptCity: 'Hazrat Nizamuddin',
    duration: '41h 25m',
    arrTime: '23:40',
    arrStation: 'TVC',
    arrCity: 'Thiruvananthapuram',
    classes: [
      { code: '3A', generalStatus: 'AVAILABLE - 0050', tatkalStatus: 'TATKAL AVAILABLE - 0016', ladiesStatus: 'LADIES AVAILABLE - 0008', cnf: 'CNF 99% High Chance', price: 3450 },
      { code: '2A', generalStatus: 'AVAILABLE - 0016', tatkalStatus: 'TATKAL AVAILABLE - 0005', ladiesStatus: 'LADIES AVAILABLE - 0002', cnf: 'CNF 100% High Chance', price: 4890 }
    ]
  }
];

export default function SearchResultsPage({ fromStation, toStation, displayDateStr, onSelectClassForBooking, onBackToHome }) {
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL'); // 'ALL' | 'EARLY' | 'MORNING' | 'AFTERNOON' | 'NIGHT'

  // WORKING FILTER LOGIC
  const filteredTrains = DUMMY_TRAINS.filter(train => {
    // AC Only Filter
    if (filterAcOnly) {
      const hasAc = train.classes.some(c => ['3A', '2A', '1A', 'CC', 'EC'].includes(c.code));
      if (!hasAc) return false;
    }

    // Available Seats Only Filter (Checks status based on active quota)
    if (filterAvailableOnly) {
      const hasAvail = train.classes.some(c => {
        const st = selectedQuota === 'TATKAL' ? c.tatkalStatus : (selectedQuota === 'LADIES' ? c.ladiesStatus : c.generalStatus);
        return st.includes('AVAILABLE');
      });
      if (!hasAvail) return false;
    }

    // Departure Time Slot Filter
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

        {/* WORKING QUOTA SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Quota:</span>
          {[
            { id: 'GENERAL', label: 'GENERAL' },
            { id: 'TATKAL', label: '⚡ TATKAL' },
            { id: 'LADIES', label: '👩 LADIES' }
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
                    {selectedQuota === 'TATKAL' && (
                      <span style={{ fontSize: '0.7rem', background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                        ⚡ TATKAL QUOTA ACTIVE
                      </span>
                    )}
                    {selectedQuota === 'LADIES' && (
                      <span style={{ fontSize: '0.7rem', background: '#fdf2f8', color: '#be185d', border: '1px solid #fce7f3', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                        👩 LADIES QUOTA ACTIVE
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>SUPERFAST • GUARANTEED REFUND</span>
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

                {/* CLASS MATRIX ROW (DYNAMICALLY UPDATING BY QUOTA) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {train.classes.map(cls => {
                    const statusText = selectedQuota === 'TATKAL' ? cls.tatkalStatus : (selectedQuota === 'LADIES' ? cls.ladiesStatus : cls.generalStatus);
                    const price = selectedQuota === 'TATKAL' ? cls.price + 350 : cls.price;
                    const isAvail = statusText.includes('AVAILABLE');

                    return (
                      <div key={cls.code} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cls.code}</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{price}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isAvail ? '#3aa459' : '#d97706', marginBottom: '0.25rem' }}>
                            {statusText}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                            {cls.cnf}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectClassForBooking(train, { ...cls, price })}
                          style={{
                            marginTop: '0.75rem',
                            background: isAvail ? '#3aa459' : '#e2e8f0',
                            color: isAvail ? '#ffffff' : '#64748b',
                            border: 'none',
                            padding: '0.45rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: isAvail ? 'pointer' : 'not-allowed',
                            width: '100%'
                          }}
                        >
                          {isAvail ? 'BOOK' : 'NOT AVAIL'}
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
