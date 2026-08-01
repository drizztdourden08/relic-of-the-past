/* @layer shared-game @kind logic */
/**
 * Reverse gameId -> CheckRecord lookups. Native code only ever reports one of
 * a handful of detection facts (see CheckGameId's field comments): a chest's
 * own index, a progress-buffer bit, a bare room-mask bit, an overworld-mask
 * bit, an event's threshold value, or an NPC sprite type. Each mode gets its
 * own map, built once in rebuild(); checkByGameId(match) below tries them
 * most-specific first, so a match built from a record's own full gameId
 * resolves through the most reliable mode it has fields for.
 *
 * A few native facts are genuinely shared by two different records — a boss
 * kill and its prize both flip the same room-mask bit; CheckGameId carries no
 * field that tells the pair apart. disambiguate() narrows a same-key
 * candidate list by whatever extra identifying field the match supplies
 * (spriteType, room, owWorld); when nothing narrows it further it returns
 * whichever candidate was registered first (source order) — a deliberate,
 * deterministic tie-break, not a guess. For a boss/prize pair specifically,
 * DungeonRecord.bossCheckId / prizeCheckId are the reliable way to name each
 * half; a couple of standing-item pairs (see the coverage report) have no
 * such alternate id and stay genuinely tied.
 */
import type { CheckGameId, CheckRecord } from '../types';

const checkByChest = new Map<string, CheckRecord>();
const checkByBuffer = new Map<string, CheckRecord[]>();
const checkByRoomMask = new Map<string, CheckRecord[]>();
const checkByOwScreen = new Map<string, CheckRecord[]>();
const checkBySpriteType = new Map<number, CheckRecord[]>();
const checkByEventThreshold = new Map<string, CheckRecord>();

const eventKey = (bufferIndex: number, compare: string, value: number | number[] | undefined): string =>
  `${bufferIndex}:${compare}:${JSON.stringify(value)}`;

const pushInto = <K>(map: Map<K, CheckRecord[]>, key: K, record: CheckRecord): void => {
  const bucket = map.get(key);
  if (bucket) bucket.push(record); else map.set(key, [record]);
};

const rebuildCheckIndex = (records: readonly CheckRecord[]): void => {
  checkByChest.clear();
  checkByBuffer.clear();
  checkByRoomMask.clear();
  checkByOwScreen.clear();
  checkBySpriteType.clear();
  checkByEventThreshold.clear();

  for (const check of records) {
    const { roomId, chestIndex, mask, owScreen, bufferIndex, compare, value, spriteType } = check.gameId;
    if (roomId !== undefined && chestIndex !== undefined) checkByChest.set(`${roomId}:${chestIndex}`, check);
    if (bufferIndex !== undefined && mask !== undefined) pushInto(checkByBuffer, `${bufferIndex}:${mask}`, check);
    if (roomId !== undefined && mask !== undefined && chestIndex === undefined) {
      pushInto(checkByRoomMask, `${roomId}:${mask}`, check);
    }
    if (owScreen !== undefined && mask !== undefined) pushInto(checkByOwScreen, `${owScreen}:${mask}`, check);
    if (spriteType !== undefined) pushInto(checkBySpriteType, spriteType, check);
    if (bufferIndex !== undefined && compare !== undefined) checkByEventThreshold.set(eventKey(bufferIndex, compare, value), check);
  }
};

const narrow = (pool: readonly CheckRecord[], pred: (c: CheckRecord) => boolean): readonly CheckRecord[] => {
  const next = pool.filter(pred);
  return next.length > 0 ? next : pool;
};

/** See the file header: narrows same-key ties by spriteType/room/owWorld, else first-registered wins. */
const disambiguate = (candidates: readonly CheckRecord[], match: Partial<CheckGameId>): CheckRecord | undefined => {
  let pool = candidates;
  if (match.spriteType !== undefined) pool = narrow(pool, (c) => c.gameId.spriteType === match.spriteType);
  if (match.room !== undefined) pool = narrow(pool, (c) => c.gameId.room === match.room);
  if (match.owWorld !== undefined) pool = narrow(pool, (c) => c.gameId.owWorld === match.owWorld);
  return pool[0];
};

/**
 * Resolves a native detection fact to its CheckRecord. Precedence, most
 * specific first: chest index, progress-buffer bit, event threshold, bare
 * room-mask bit, overworld-mask bit, bare sprite type. A match carrying
 * fields for more than one mode (e.g. a record's own full gameId) resolves
 * through whichever of these hits first, so the more identifying fact wins.
 */
const checkByGameId = (match: Partial<CheckGameId>): CheckRecord | undefined => {
  if (match.roomId !== undefined && match.chestIndex !== undefined) {
    const hit = checkByChest.get(`${match.roomId}:${match.chestIndex}`);
    if (hit) return hit;
  }
  if (match.bufferIndex !== undefined && match.mask !== undefined) {
    const hit = disambiguate(checkByBuffer.get(`${match.bufferIndex}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.bufferIndex !== undefined && match.compare !== undefined) {
    const hit = checkByEventThreshold.get(eventKey(match.bufferIndex, match.compare, match.value));
    if (hit) return hit;
  }
  if (match.roomId !== undefined && match.mask !== undefined) {
    const hit = disambiguate(checkByRoomMask.get(`${match.roomId}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.owScreen !== undefined && match.mask !== undefined) {
    const hit = disambiguate(checkByOwScreen.get(`${match.owScreen}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.spriteType !== undefined) {
    const hit = disambiguate(checkBySpriteType.get(match.spriteType) ?? [], match);
    if (hit) return hit;
  }
  return undefined;
};

export { rebuildCheckIndex, checkByGameId };
