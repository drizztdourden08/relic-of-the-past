/* @layer shared-game @kind logic */
/**
 * Identifies a raw flag diff as one of the known checks, using the check records'
 * own gameId. This is IDENTIFICATION only. Detection already happened via
 * byte-diffing. A diff that matches no known check yields nothing, so the recorder
 * can propose a dataset fix.
 *
 * Every matcher returns the RECORD, so the caller holds the check's id. They used
 * to return `randomizerName`, which a lookup table then had to turn back into a
 * record. That table was keyed by id AND name at once, so with 11 dungeons
 * each holding a "Big Chest" the later name won and 57 checks became unreachable:
 * one dungeon's chest resolved to another dungeon's record, and its key with it.
 */
import type { FlagDiff } from '../types';
import { find } from '../../data';
import type { CheckRecord } from '../../data';

const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;

const ALL_CHECKS = find('check', () => true);

const matchRoom = (diff: FlagDiff): CheckRecord | undefined => {
  for (const c of ALL_CHECKS) {
    const { roomId, chestIndex, mask } = c.gameId;
    if (roomId !== diff.index) continue;
    if (chestIndex !== undefined && (CHEST_OPEN_MASKS[chestIndex] & diff.setBits) !== 0) return c;
    if (mask !== undefined && chestIndex === undefined && (mask & diff.setBits) !== 0) return c;
  }
  return undefined;
};

const matchOverworld = (diff: FlagDiff): CheckRecord | undefined => {
  for (const c of ALL_CHECKS) {
    const { owScreen, mask } = c.gameId;
    if (owScreen === diff.index && mask !== undefined && (mask & diff.setBits) !== 0) return c;
  }
  return undefined;
};

const matchProgress = (diff: FlagDiff): CheckRecord | undefined => {
  for (const c of ALL_CHECKS) {
    const { bufferIndex, mask, roomId } = c.gameId;
    if (bufferIndex !== diff.index || mask === undefined || roomId !== undefined) continue;
    const hit = mask === 0xff ? diff.after !== 0 : (mask & diff.setBits) !== 0;
    if (hit) return c;
  }
  return matchEvent(diff);
};

/**
 * Progression events are THRESHOLD reads of the progress buffer, not bitmasks
 * (sram_progress_indicator 1 = post-uncle, 2 = the rescue completed). A diff
 * names an event only when it CROSSES that threshold, and the highest crossed
 * threshold wins. Reaching 2 is the COMPLETED rescue, not the started one.
 */
const matchEvent = (diff: FlagDiff): CheckRecord | undefined => {
  const crossed = ALL_CHECKS
    .filter(c => c.gameId.bufferIndex === diff.index && c.gameId.compare !== undefined)
    .flatMap(c => {
      const values = Array.isArray(c.gameId.value) ? c.gameId.value : c.gameId.value !== undefined ? [c.gameId.value] : [];
      return values.map(v => ({ check: c, v, compare: c.gameId.compare }));
    })
    .filter(({ v, compare }) => (compare === 'eq' || compare === 'any-of' ? diff.after === v : diff.before < v && diff.after >= v))
    .sort((a, b) => b.v - a.v);
  return crossed[0]?.check;
};

/** The check a single diff identifies, or undefined when nothing matches. */
const matchDiff = (diff: FlagDiff): CheckRecord | undefined => {
  if (diff.kind === 'room') return matchRoom(diff);
  if (diff.kind === 'overworld') return matchOverworld(diff);
  return matchProgress(diff);
};

/** First identified check across a set of diffs, or undefined when none match. */
const matchDiffs = (diffs: FlagDiff[]): CheckRecord | undefined => {
  for (const diff of diffs) {
    const matched = matchDiff(diff);
    if (matched) return matched;
  }
  return undefined;
};

export { matchDiff, matchDiffs };
