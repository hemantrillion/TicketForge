import React from 'react';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPopoverModal({
  calYear,
  calMonth,
  handlePrevMonth,
  handleNextMonth,
  handleSelectCalDate,
  firstDayIndex,
  daysInCalMonth,
  selectedDate
}) {
  const { simDate } = useSimulationClock();

  // Calculate if a calendar day is in the past relative to simDate
  const isDateInPast = (dayNum) => {
    const checkDate = new Date(calYear, calMonth, dayNum, 23, 59, 59);
    const simTimeClean = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate(), 0, 0, 0);
    return checkDate.getTime() < simTimeClean.getTime();
  };

  return (
    <div className="ct-calendar-modal" onClick={(e) => e.stopPropagation()}>
      <div className="ct-cal-header">
        <button type="button" className="ct-cal-nav" onClick={handlePrevMonth}>‹</button>
        <div className="ct-cal-title">{MONTH_NAMES[calMonth]} {calYear}</div>
        <button type="button" className="ct-cal-nav" onClick={handleNextMonth}>›</button>
      </div>

      <div className="ct-cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="ct-cal-day-label">{d}</div>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="ct-cal-day empty"></div>
        ))}

        {Array.from({ length: daysInCalMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected = selectedDate.getDate() === dayNum && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear;
          const isPast = isDateInPast(dayNum);

          return (
            <div
              key={dayNum}
              className={`ct-cal-day ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (!isPast) handleSelectCalDate(dayNum);
              }}
              style={{
                opacity: isPast ? 0.35 : 1,
                cursor: isPast ? 'not-allowed' : 'pointer'
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
