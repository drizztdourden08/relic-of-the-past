/* @layer bridge-wasm @kind logic */
/**
 * Per-record native-fact tests: whether a CheckRecord's own `gameId` reads as complete from the
 * live WASM heap. Each record is tested on its own fields, so a fact shared by two records (a
 * boss and its prize flip the same room bit) resolves both; no reverse lookup that could only
 * hand back one winner. The one fact with no record-owned address is the "out of bed" read (a
 * direct WRAM offset), which is what the facade's reverse index stays for.
 */
import { getCheckByGameId } from '@shared/game/data';
import type { CheckGameId, CheckId } from '@shared/game/data';

/** Room-state slots for the six bits a chest-open word can carry. */
const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;

/** Index into the progress buffer that carries player_sleep_in_bed_state. */
const BED_STATE_BUFFER_INDEX = 12;

const thresholdMet = (val: number, compare: 'gte' | 'eq' | 'any-of', value: number | number[] | undefined): boolean => {
  if (compare === 'gte') return val >= (value as number);
  if (compare === 'eq') return val === (value as number);
  if (compare === 'any-of') return (value as number[]).includes(val);
  return false;
};

/** Chest slot or direct room-mask bit, whichever the record's own gameId carries. */
const isRoomFactMet = (gameId: CheckGameId, readRoomWord: (roomId: number) => number): boolean => {
  const { roomId, chestIndex, mask } = gameId;
  if (roomId === undefined) return false;
  if (chestIndex !== undefined) return (readRoomWord(roomId) & CHEST_OPEN_MASKS[chestIndex]) !== 0;
  if (mask !== undefined) return (readRoomWord(roomId) & mask) !== 0;
  return false;
};

/** Overworld event bit (standing items, dig spots, events). */
const isOverworldFactMet = (gameId: CheckGameId, readOwByte: (owScreen: number) => number): boolean => {
  const { owScreen, mask } = gameId;
  return owScreen !== undefined && mask !== undefined && (readOwByte(owScreen) & mask) !== 0;
};

/** NPC progress-buffer bit or event threshold, whichever the record's own gameId carries. */
const isProgressFactMet = (gameId: CheckGameId, readProgByte: (bufferIndex: number) => number): boolean => {
  const { bufferIndex, mask, compare, value } = gameId;
  if (bufferIndex === undefined) return false;
  if (mask !== undefined) return (readProgByte(bufferIndex) & mask) !== 0;
  if (compare !== undefined) return thresholdMet(readProgByte(bufferIndex), compare, value);
  return false;
};

/** A save loaded past the first gift is out of bed even if the bed-state byte no longer says so, so the progress indicator (buffer index 0) answers too. Only for the record owning BED_STATE_BUFFER_INDEX. */
const isOutOfBedFallbackMet = (gameId: CheckGameId, readProgByte: (bufferIndex: number) => number): boolean =>
  gameId.bufferIndex === BED_STATE_BUFFER_INDEX && readProgByte(0) >= 1;

/** The out-of-bed CheckId, resolved from the raw native fact: the one legitimate use of the reverse index left in polling (see file header). */
const outOfBedCheckId = (): CheckId | undefined =>
  getCheckByGameId({ bufferIndex: BED_STATE_BUFFER_INDEX, compare: 'gte', value: 2 })?.id;

export { isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet, outOfBedCheckId };
