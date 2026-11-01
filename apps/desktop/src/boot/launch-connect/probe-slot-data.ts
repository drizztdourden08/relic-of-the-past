/* @layer renderer-app @kind logic */
import { serverUrlCandidates } from '@rotp/randomizer';
import { probeSlotAttempt } from './probe-slot-attempt';
import type { ProbeTarget, SlotProbe } from './slot-probe.type';

/** Connects to the server as the slot and returns the slot data it holds, trying ws:// then wss:// until one answers. */
const probeSlotData = async (target: ProbeTarget): Promise<SlotProbe> => {
  const candidates = serverUrlCandidates(target.url);
  let last: SlotProbe = { ok: false, error: 'no server address' };
  for (const url of candidates) {
    const { result, opened } = await probeSlotAttempt({ ...target, url });
    if (result.ok || opened) return result;
    last = result;
  }
  return last;
};

export { probeSlotData };
