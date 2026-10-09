/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import { getFps } from '../../../../../../lib/game';

const useFpsReadout = (showFps: boolean, gameRunning: boolean) => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!showFps || !gameRunning) {
      setFps(0);
      return;
    }
    const id = setInterval(() => {
      setFps(getFps());
    }, 500);
    return () => clearInterval(id);
  }, [showFps, gameRunning]);

  return { fps };
};

export { useFpsReadout };
