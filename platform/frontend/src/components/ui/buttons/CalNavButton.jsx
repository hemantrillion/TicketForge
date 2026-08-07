import React from 'react';

export default function CalNavButton({ direction, onClick }) {
  return (
    <span className="ct-cal-nav" onClick={onClick}>
      {direction === 'prev' ? '‹' : '›'}
    </span>
  );
}
