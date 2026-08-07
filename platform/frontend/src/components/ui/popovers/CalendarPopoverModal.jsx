import React from 'react';
import CalNavButton from '../buttons/CalNavButton';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPopoverModal({
  calYear, calMonth,
  handlePrevMonth, handleNextMonth,
  handleSelectCalDate,
  firstDayIndex, daysInCalMonth,
  selectedDate
}) {
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
  );
}
