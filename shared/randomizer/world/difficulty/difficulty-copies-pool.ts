/* @layer shared-game @kind logic */
/**
 * The copy multiples applied to an assembled pool.
 *
 * This runs LAST of the three passes that reshape a tiered family, after the
 * tier ticks and after the per-family order (progressive/), and that order is
 * the whole design. The ticks decide which rungs exist, the order decides
 * whether the copies are nameless steps or the rungs themselves, and only then
 * is there something to multiply: whatever names the family's copies are
 * wearing by that point are put in again, once more per extra multiple.
 * Running earlier would multiply copies the ticks were about to remove, or
 * hand the order pass more copies than it has rungs to name.
 *
 * Unlike those two passes this one GROWS the pool, so it reports how many
 * items it added and the caller displaces exactly that many filler items
 * (pool/balance-filler.ts), the same arithmetic a capacity upgrade already
 * goes through, so the fill stays one item per open location and nothing
 * downstream learns a second rule.
 *
 * What an extra copy really hands over is already answered by the core rather
 * than here. A surplus progressive copy past the top rung pays the reference's
 * twenty-rupee replacement, and so does a concrete rung that arrives for a tier
 * the file already stands at or above (core/game-hooks/progressive_grants.c),
 * so a doubled family is never a pickup that does nothing.
 */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { isRandomOrder } from '../progressive/progressive-modes.data';
import { DEFAULT_COPY_MULTIPLIER } from './difficulty.data';
import type { ProgressiveModeSetting } from '../progressive/progressive.type';
import type { CopyMultiplierSetting } from './difficulty.type';

/** The names one family's copies wear in a finished pool, under its own order. */
const carriedNamesOf = (
  familyIndex: number, modes: ProgressiveModeSetting,
): readonly string[] => {
  const family = PROGRESSIVE_FAMILIES[familyIndex];
  return isRandomOrder(modes, family.id) ? family.tiers : [family.poolItem];
};

const countOf = (pool: readonly string[], name: string): number =>
  pool.reduce((total, item) => (item === name ? total + 1 : total), 0);

/**
 * In place: every copy the shuffle carries of a multiplied family is put in
 * again, once per extra multiple. Returns how many items were added, which is
 * how much filler the caller must displace for them.
 */
const applyCopyMultipliers = (
  pool: string[], modes: ProgressiveModeSetting, copies: CopyMultiplierSetting,
): number => {
  const added: string[] = [];
  PROGRESSIVE_FAMILIES.forEach((family, index) => {
    const extra = (copies[family.id] ?? DEFAULT_COPY_MULTIPLIER) - DEFAULT_COPY_MULTIPLIER;
    if (extra <= 0) return;
    for (const name of carriedNamesOf(index, modes)) {
      const carried = countOf(pool, name);
      for (let copy = 0; copy < carried * extra; copy += 1) added.push(name);
    }
  });
  pool.push(...added);
  return added.length;
};

export { applyCopyMultipliers };
