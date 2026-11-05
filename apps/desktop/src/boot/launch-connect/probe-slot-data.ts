/* @layer renderer-app @kind logic */
import { serverCandidates } from '@drizztdourden08/brock-randomizer/archipelago';
import { probeSlotAttempt } from './probe-slot-attempt';
import type { ProbeTarget, SlotProbe } from './slot-probe.type';

const probeSlotData = async (target: ProbeTarget): Promise<SlotProbe> => {
  const candidates = serverCandidates(target.url);
  let last: SlotProbe = { ok: false, error: 'no server address' };
  for (const url of candidates) {
    const { result, opened } = await probeSlotAttempt({ ...target, url });
    if (result.ok || opened) return result;
    last = result;
  }
  return last;
};

export { probeSlotData };
