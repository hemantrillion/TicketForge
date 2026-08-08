import React from 'react';
import CalNavButton from '../buttons/CalNavButton';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPopoverModal({
  calYear, calMonth,
  handlePrevMonth, handleNextMonth,
  handleSelectCalDate,
  firstDayIndex, daysInCalMonth,
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
        <CalNavButton direction="prev" onClick={handlePrevMonth} />
        <span>{MONTH_NAMES[calMonth]} {calYear}</span>
        <CalNavButton direction="next" onClick={handleNextMonth} />
      </div>
      <div className="ct-cal-days">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div className="ct-cal-grid">
        {[...Array(firstDayIndex)].map((_, i) => <div key={`blank-${i}`} />)}
        {[...Array(daysInCalMonth)].map((_, idx) => {
          const dayNum = idx + 1;
          const isSelected = selectedDate.getDate() === dayNum && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear;
          const isPast = isDateInPast(dayNum);

          return (
            <div
              key={dayNum}
              className={`ct-cal-date ${isSelected ? 'active' : ''}`}
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
