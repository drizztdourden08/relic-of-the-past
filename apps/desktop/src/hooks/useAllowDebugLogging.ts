/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { liveSettingsNow } from '@app/game/live-settings';
import { POLL_MS } from './allow-debug-logging.constants';

const useAllowDebugLogging = (): boolean => {
  const [allowed, setAllowed] = useState(() => liveSettingsNow()?.allowDebugLogging ?? false);

  useEffect(() => {
    const id = setInterval(() => {
      setAllowed(liveSettingsNow()?.allowDebugLogging ?? false);
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return allowed;
};

export { useAllowDebugLogging };
