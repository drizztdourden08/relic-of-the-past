/* @layer bridge-wasm @kind logic */
import { startupFlag } from '@app/launch-flags/startup-flag';

const eventLogEnabled = (): boolean => {
  try {
    return startupFlag('event-log') !== undefined;
  } catch {
    return false;
  }
};

export { eventLogEnabled };
