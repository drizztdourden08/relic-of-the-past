/* @layer shared-game @kind logic */
/**
 * Pure byte-diffing of raw SRAM snapshots. This layer never touches check data.
 * It only reports which flag bytes changed and which bits were newly set.
 * Naming those changes is the matcher's job.
 */
import type { FlagSnapshot, FlagDiff } from '../types';

const DUNG_INFO_LEN = 320;
// save_ow_event_info base is 0xF280; the flag tables index up to screen 0x81.
// Screens 0x80 (the sword pedestal) and 0x81 (the waterfall ledge) alias into the
// adjacent SRAM word at 0xF300/0xF301, so the buffer must span through 0x81.
const OW_EVENT_LEN = 0x82;
const PROGRESS_LEN = 21;

const emptySnapshot = (): FlagSnapshot => ({
  dungInfo: new Uint16Array(DUNG_INFO_LEN),
  owEventInfo: new Uint8Array(OW_EVENT_LEN),
  progress: new Uint8Array(PROGRESS_LEN),
});

const cloneSnapshot = (snap: FlagSnapshot): FlagSnapshot => ({
  dungInfo: Uint16Array.from(snap.dungInfo),
  owEventInfo: Uint8Array.from(snap.owEventInfo),
  progress: Uint8Array.from(snap.progress),
});

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

/** Emit one FlagDiff per changed byte/word across all three buffers. */
const diffSnapshots = (before: FlagSnapshot, after: FlagSnapshot): FlagDiff[] => {
  const diffs: FlagDiff[] = [];
  diffBuffer('room', before.dungInfo, after.dungInfo, diffs);
  diffBuffer('overworld', before.owEventInfo, after.owEventInfo, diffs);
  diffBuffer('progress', before.progress, after.progress, diffs);
  return diffs;
};

export { emptySnapshot, cloneSnapshot, diffSnapshots, DUNG_INFO_LEN, OW_EVENT_LEN, PROGRESS_LEN };
