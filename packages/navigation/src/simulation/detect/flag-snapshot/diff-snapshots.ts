/* @layer shared-game @kind logic */
import type { FlagSnapshot, FlagDiff } from '../../types';

const diffBuffer = (
  kind: FlagDiff['kind'],
  before: Uint8Array | Uint16Array,
  after: Uint8Array | Uint16Array,
  out: FlagDiff[],
): void => {
  const len = Math.min(before.length, after.length);
  for (let i = 0; i < len; i++) {
    const b = before[i];
    const a = after[i];
    if (b === a) continue;
    out.push({ kind, index: i, before: b, after: a, setBits: (b ^ a) & a });
  }
};

const diffSnapshots = (before: FlagSnapshot, after: FlagSnapshot): FlagDiff[] => {
  const diffs: FlagDiff[] = [];
  diffBuffer('room', before.dungInfo, after.dungInfo, diffs);
  diffBuffer('overworld', before.owEventInfo, after.owEventInfo, diffs);
  diffBuffer('progress', before.progress, after.progress, diffs);
  return diffs;
};

export { diffSnapshots };
