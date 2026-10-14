/* @layer renderer-widgets @kind hook */
import { useState, useEffect } from 'react';
import { DEBUG_TICK_MS, DEBUG_TICK_WRAP } from '../NavigationWidget.constants';

const useDebugTick = (): number => {
  const [debugTick, setDebugTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDebugTick(t => (t + 1) & DEBUG_TICK_WRAP), DEBUG_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return debugTick;
};

export { useDebugTick };
