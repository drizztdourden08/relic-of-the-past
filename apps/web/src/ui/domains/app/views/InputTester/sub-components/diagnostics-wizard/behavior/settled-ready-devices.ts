/* @layer renderer-components @kind logic */
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import type { DeviceEntry } from '@shared/ipc';
import { SETTLE_MS, SHUTDOWN_POLL_MS } from '../diagnostics-wizard.constants';
import { sleep } from './sleep';

const settledReadyDevices = async (isCancelled: () => boolean): Promise<DeviceEntry[]> => {
  const deadline = Date.now() + SETTLE_MS;
  let best: DeviceEntry[] = [];
  let stableFor = 0;

  while (Date.now() < deadline && !isCancelled()) {
    const ready = (await listControllerDevices()).filter((d) => d.status === 'ready');
    if (ready.length > best.length) {
      best = ready;
      stableFor = 0;
    } else {
      stableFor += SHUTDOWN_POLL_MS;
      if (best.length > 0 && stableFor >= SHUTDOWN_POLL_MS * 2) return best;
    }
    await sleep(SHUTDOWN_POLL_MS);
  }
  return best;
};

export { settledReadyDevices };
