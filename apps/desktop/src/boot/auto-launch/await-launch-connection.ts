/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { screenshotHold } from '../screenshot-hold';
import { CONNECTION_FAILURE_TEXT } from './auto-launch.constants';
import { launchesConnection } from './launches-connection';
import { waitForConnection } from './wait-for-connection';

const awaitLaunchConnection = async (isCancelled: () => boolean): Promise<boolean> => {
  if (!launchesConnection()) return true;
  log.app('[AutoTest] Waiting for the Archipelago client to connect before the save load and input script');
  const verdict = await waitForConnection(isCancelled);
  if (verdict === 'connected') {
    log.app('[AutoTest] Archipelago client connected, the auto test starts');
    return true;
  }
  if (verdict !== 'cancelled') log.app(CONNECTION_FAILURE_TEXT[verdict], 'error');
  screenshotHold.release();
  return false;
};

export { awaitLaunchConnection };
