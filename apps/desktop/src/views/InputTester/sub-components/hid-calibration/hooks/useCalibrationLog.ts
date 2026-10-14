/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import { LOG_KEEP_LINES } from './hid-calibration-hook.constants';

const useCalibrationLog = (logRef: React.RefObject<HTMLDivElement | null>) => {
  const [log, setLog] = useState<string[]>([]);
  const addLog = useCallback((msg: string) => setLog(prev => [...prev.slice(-LOG_KEEP_LINES), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  return { log, addLog };
};

export { useCalibrationLog };
