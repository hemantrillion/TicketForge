import React, { createContext, useState, useEffect, useContext } from 'react';

const SimulationClockContext = createContext();

export function SimulationClockProvider({ children }) {
  // Baseline Simulation Date: 09 Aug 2026, 06:00:00 AM
  const [simDate, setSimDate] = useState(new Date(2026, 7, 9, 6, 0, 0));
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 6x, 12x, 24x (where 24x means 1 real minute = 24 sim hours)
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Tick every 1000ms (1 real second)
    const interval = setInterval(() => {
      setSimDate(prevDate => {
        // Calculate simulated seconds per real second:
        // 1x  = 1 sim sec / real sec
        // 2x  = 2 sim sec / real sec
        // 6x  = 360 sim sec / real sec (6 sim mins / real sec)
        // 12x = 720 sim sec / real sec (12 sim mins / real sec)
        // 24x = 1440 sim sec / real sec (24 sim mins / real sec => 1 real min = 24 sim hours = 1 sim day!)
        let simSecondsToAdd = 1;
        if (simSpeed === 2) simSecondsToAdd = 2;
        else if (simSpeed === 6) simSecondsToAdd = 360;
        else if (simSpeed === 12) simSecondsToAdd = 720;
        else if (simSpeed === 24) simSecondsToAdd = 1440;

        return new Date(prevDate.getTime() + simSecondsToAdd * 1000);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simSpeed, isPaused]);

  return (
    <SimulationClockContext.Provider value={{ simDate, setSimDate, simSpeed, setSimSpeed, isPaused, setIsPaused }}>
      {children}
    </SimulationClockContext.Provider>
  );
}

export function useSimulationClock() {
  return useContext(SimulationClockContext);
}
