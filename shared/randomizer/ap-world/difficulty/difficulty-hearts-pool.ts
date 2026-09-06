/* @layer shared-game @kind logic */
/**
 * The heart ceiling applied to an assembled pool.
 *
 * A ceiling is enforced by carrying fewer heart pickups, never by patching the
 * game: the container receipt already refuses to raise capacity past twenty
 * (core/zelda3/src/ancilla.c 3494), so the only way to land under that is for
 * the seed not to hold the pickups. A pickup the ceiling takes out is
 * CONVERTED IN PLACE to the twenty-rupee stand-in the reference uses for a
 * copy that is not there, exactly as an unticked rung is, so the pool keeps
 * its size, the fill stays one item per open location, and no filler
 * arithmetic is needed.
 *
 * Quarter pieces go first, whole sets of four at a time, and the containers
 * only once no set is left. Two reasons, both real: four pieces and one
 * container are worth the same heart, so taking the pieces first removes the
 * most pickups whose loss the player will not feel, and it keeps a container
 * in the seed at almost every ceiling, which is the pickup the reference
 * promotes to progression for its hearts-as-requirement branch
 * (pool/item-classes.data.ts). A part-set of pieces left behind by a set-sized
 * step is left alone: it was already worth nothing before the ceiling was
 * lowered, and inventing a rule for it here would change a pool the ceiling
 * never touched.
 *
 * Nothing in the access rules is stranded by this. The two rules that read
 * hearts (the spike room and the long magic cape crossing) each offer them as
 * ONE alternative beside items every seed carries, so even a ceiling of three
 * (no growth at all) leaves both satisfiable.
 */
import { ITEM } from '../item-names.data';
import { REPLACEMENT_ITEM } from '../progressive/progressive-families.data';
import { PIECES_PER_HEART, STARTING_HEARTS, asHeartCap } from './difficulty.data';

const countOf = (pool: readonly string[], name: string): number =>
  pool.reduce((total, item) => (item === name ? total + 1 : total), 0);

/** How many hearts the pool would add to the three a file starts with. */
const heartGrowthOf = (pool: readonly string[]): number =>
  countOf(pool, ITEM.bossHeartContainer)
  + countOf(pool, ITEM.sanctuaryHeartContainer)
  + Math.floor(countOf(pool, ITEM.pieceOfHeart) / PIECES_PER_HEART);

/** The last copy of |name| becomes the stand-in pickup; false when there is none left. */
const convertLast = (pool: string[], name: string): boolean => {
  const index = pool.lastIndexOf(name);
  if (index === -1) return false;
  pool[index] = REPLACEMENT_ITEM;
  return true;
};

/** One whole set of quarter pieces, or false when a whole set is no longer there. */
const convertPieceSet = (pool: string[]): boolean => {
  if (countOf(pool, ITEM.pieceOfHeart) < PIECES_PER_HEART) return false;
  for (let piece = 0; piece < PIECES_PER_HEART; piece += 1) convertLast(pool, ITEM.pieceOfHeart);
  return true;
};

/**
 * In place: heart pickups are converted until the pool can no longer carry the
 * file past |cap| hearts. Returns how many hearts of growth were taken out,
 * zero at the default ceiling, where the pool is left byte-identical.
 */
const applyHeartCap = (pool: string[], cap: number): number => {
  let excess = heartGrowthOf(pool) - (asHeartCap(cap) - STARTING_HEARTS);
  let removed = 0;
  while (excess > 0 && convertPieceSet(pool)) { excess -= 1; removed += 1; }
  while (excess > 0 && convertLast(pool, ITEM.bossHeartContainer)) { excess -= 1; removed += 1; }
  while (excess > 0 && convertLast(pool, ITEM.sanctuaryHeartContainer)) { excess -= 1; removed += 1; }
  return removed;
};

export { applyHeartCap, heartGrowthOf };
