/* @layer renderer-components @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { CLAIM_TIMEOUT_MS, LAYOUT_POLL_MS } from '../diagnostics-wizard.constants';
import { sleep } from './sleep';

const awaitClaimedEntry = async (deviceKey: string): Promise<DeviceEntry | null> => {
  const deadline = Date.now() + CLAIM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const entries = (await inputApi()?.list()) ?? [];
    const match = entries.find((d) => d.deviceKey === deviceKey && d.status === 'ready' && d.hasButton?.length);
    if (match) return match;
    await sleep(LAYOUT_POLL_MS);
  }
  return null;
};

export { awaitClaimedEntry };
