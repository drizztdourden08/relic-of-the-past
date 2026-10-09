/* @layer renderer-components @kind logic */
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import type { DeviceEntry } from '@shared/ipc';
import { CLAIM_TIMEOUT_MS, LAYOUT_POLL_MS } from '../diagnostics-wizard.constants';
import { sleep } from './sleep';

const awaitClaimedEntry = async (deviceKey: string): Promise<DeviceEntry | null> => {
  const deadline = Date.now() + CLAIM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const entries = await listControllerDevices();
    const match = entries.find((d) => d.deviceKey === deviceKey && d.status === 'ready' && d.hasButton?.length);
    if (match) return match;
    await sleep(LAYOUT_POLL_MS);
  }
  return null;
};

export { awaitClaimedEntry };
