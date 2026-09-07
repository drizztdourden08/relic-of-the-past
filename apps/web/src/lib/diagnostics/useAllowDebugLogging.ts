/* @layer renderer-lib @kind hook */
/** Live read of GameSettings.allowDebugLogging, the gate for every debug-report control.
 *  Settings aren't a reactive store during gameplay, so this polls the same live snapshot
 *  the WASM bridge keeps primed, on the same cadence the Navigation widget already uses
 *  for its own live values. */
import { useEffect, useState } from 'react';
import { liveSettingsNow } from '@app/lib/game/live-settings';

const POLL_MS = 1000;

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
