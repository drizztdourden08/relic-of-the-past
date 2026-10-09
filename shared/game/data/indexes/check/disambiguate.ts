/* @layer shared-game @kind logic */
import type { CheckGameId, CheckRecord } from '../../types';

const narrow = (pool: readonly CheckRecord[], pred: (c: CheckRecord) => boolean): readonly CheckRecord[] => {
  const next = pool.filter(pred);
  return next.length > 0 ? next : pool;
};

const disambiguate = (candidates: readonly CheckRecord[], match: Partial<CheckGameId>): CheckRecord | undefined => {
  let pool = candidates;
  if (match.spriteType !== undefined) pool = narrow(pool, (c) => c.gameId.spriteType === match.spriteType);
  if (match.room !== undefined) pool = narrow(pool, (c) => c.gameId.room === match.room);
  if (match.owWorld !== undefined) pool = narrow(pool, (c) => c.gameId.owWorld === match.owWorld);
  return pool[0];
};

export { disambiguate };
