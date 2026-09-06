/* @layer bridge-wasm @kind logic */
/**
 * Check detection: derives, from a check record's own gameId, the live-memory
 * read that proves the check completed: a persisted room-flag bit (chest slot,
 * direct mask, or an NPC's room-recorded chest bit), an overworld event bit,
 * or a progress-buffer byte (bit mask or threshold). Mirrors the tracker's
 * check-facts read modes so the poller and the tracker agree on what "done"
 * means. Review-gated like the registry: a record below 'accepted' yields no
 * detection, so uncertified data can never fire a report. A pond compare is
 * re-based on a Custom family's starting rung (withProgressBaseline): from
 * the empty rung the first purchase leaves the tier byte at 0 and clears the
 * family's empty-rung flag instead, so that start reads the flag byte.
 */

import { getCheck } from '@shared/game/data';
import type { CheckGameId, CheckId, CheckRecord } from '@shared/game/data';

/** Per-slot chest-open bits in the persisted room flag word. */
const CHEST_MASK_BASE = 0x10;

/** Progress byte of the empty-rung flag paired with a pond tier byte (state_queries_progress.c [27]/[28]). */
const EMPTY_RUNG_FLAG_OF_TIER_BYTE: ReadonlyMap<number, number> = new Map([[23, 27], [24, 28]]);

type CheckDetection =
  | { mode: 'room-mask'; roomId: number; mask: number }
  | { mode: 'ow-mask'; owScreen: number; mask: number }
  | { mode: 'progress'; bufferIndex: number; mask?: number; compare?: 'gte' | 'eq' | 'any-of'; value?: number | number[] };

// review-gating: tighten once certification lands
const passesReviewGate = (check: CheckRecord): boolean => {
  const { review } = check;
  return review === undefined || review === 'accepted' || review === 'verified';
};

const detectionOfGameId = (gameId: CheckGameId): CheckDetection | null => {
  const { roomId, chestIndex, mask, owScreen, bufferIndex, compare, value, roomFlag } = gameId;
  if (roomId !== undefined && chestIndex !== undefined) {
    return { mode: 'room-mask', roomId, mask: CHEST_MASK_BASE << chestIndex };
  }
  if (roomId !== undefined && mask !== undefined) {
    return { mode: 'room-mask', roomId, mask };
  }
  if (owScreen !== undefined && mask !== undefined) {
    return { mode: 'ow-mask', owScreen, mask };
  }
  if (bufferIndex !== undefined && mask !== undefined) {
    return { mode: 'progress', bufferIndex, mask };
  }
  if (bufferIndex !== undefined && compare !== undefined) {
    return { mode: 'progress', bufferIndex, compare, value };
  }
  if (roomFlag !== undefined) {
    return { mode: 'room-mask', roomId: roomFlag.roomId, mask: CHEST_MASK_BASE << roomFlag.chestIndex };
  }
  return null;
};

/** The detection for one check id, or null (unknown id, gated, or no read). */
const detectionOf = (checkId: string): CheckDetection | null => {
  let check: CheckRecord;
  try {
    check = getCheck(checkId as CheckId);
  } catch {
    return null;
  }
  if (!passesReviewGate(check)) return null;
  return detectionOfGameId(check.gameId);
};

/**
 * A progress threshold read against a Custom family's starting RUNG: a tier
 * byte that starts above the first native level still means "advanced by one
 * purchase" when compared past that start (rung r ⇒ level r − 1), and a start
 * on the empty rung reads the flag its first purchase clears. Every other
 * detection shape is returned untouched.
 */
const withProgressBaseline = (detection: CheckDetection | null, startRung: number | undefined): CheckDetection | null => {
  if (detection === null || startRung === undefined) return detection;
  if (detection.mode !== 'progress' || detection.compare === undefined) return detection;
  if (startRung === 0) {
    const flagIndex = EMPTY_RUNG_FLAG_OF_TIER_BYTE.get(detection.bufferIndex);
    return flagIndex === undefined ? detection : { mode: 'progress', bufferIndex: flagIndex, compare: 'eq', value: 0 };
  }
  const baseline = startRung - 1;
  if (baseline === 0) return detection;
  const { value } = detection;
  if (typeof value === 'number') return { ...detection, value: value + baseline };
  if (Array.isArray(value)) return { ...detection, value: value.map((v) => v + baseline) };
  return detection;
};

export { detectionOf, withProgressBaseline };
export type { CheckDetection };
