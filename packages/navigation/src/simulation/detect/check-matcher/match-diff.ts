/* @layer shared-game @kind logic */
import type { FlagDiff } from '../../types';
import type { CheckRecord } from '@rotp/game-data';
import { ALL_CHECKS, CHEST_OPEN_MASKS, WHOLE_BYTE_MASK } from './check-matcher.constants';

const matchRoom = (diff: FlagDiff): CheckRecord | undefined => {
  for (const c of ALL_CHECKS) {
    const { roomId, chestIndex, mask } = c.gameId;
    if (roomId !== diff.index) continue;
    if (chestIndex !== undefined && ((CHEST_OPEN_MASKS[chestIndex] ?? 0) & diff.setBits) !== 0) return c;
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

const thresholdValuesOf = (check: CheckRecord): readonly number[] => {
  const { value } = check.gameId;
  if (Array.isArray(value)) return value;
  return value !== undefined ? [value] : [];
};

const matchEvent = (diff: FlagDiff): CheckRecord | undefined => {
  const crossed = ALL_CHECKS
    .filter(c => c.gameId.bufferIndex === diff.index && c.gameId.compare !== undefined)
    .flatMap(c => thresholdValuesOf(c).map(v => ({ check: c, v, compare: c.gameId.compare })))
    .filter(({ v, compare }) => (compare === 'eq' || compare === 'any-of' ? diff.after === v : diff.before < v && diff.after >= v))
    .sort((a, b) => b.v - a.v);
  return crossed[0]?.check;
};

const matchProgress = (diff: FlagDiff): CheckRecord | undefined => {
  for (const c of ALL_CHECKS) {
    const { bufferIndex, mask, roomId } = c.gameId;
    if (bufferIndex !== diff.index || mask === undefined || roomId !== undefined) continue;
    const hit = mask === WHOLE_BYTE_MASK ? diff.after !== 0 : (mask & diff.setBits) !== 0;
    if (hit) return c;
  }
  return matchEvent(diff);
};

const matchDiff = (diff: FlagDiff): CheckRecord | undefined => {
  if (diff.kind === 'room') return matchRoom(diff);
  if (diff.kind === 'overworld') return matchOverworld(diff);
  return matchProgress(diff);
};

export { matchDiff };
