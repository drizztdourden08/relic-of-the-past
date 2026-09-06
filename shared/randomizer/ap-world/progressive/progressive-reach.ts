/* @layer shared-game @kind logic */
/**
 * What a tick list actually reaches, asked in one place.
 *
 * A copy of a family's pool item hands over the NEXT TICKED tier, so unticking
 * a middle rung closes a hole instead of leaving one: the ladder is
 * shorter. Everything downstream follows from that one reading: the tier map
 * the collection state expands a pickup through, and the two questions the
 * rules ask about blades:
 *
 *  - can a blade ever be held at all? Unticking every rung of that family IS
 *    the reference's swordless setting (Options.py Swordless), so the barriers
 *    and fights it reworks are reworked here on the same condition;
 *  - can a BEAM blade ever be held? The second rung and up throw the beam, and
 *    a few rules ask for nothing less: the tablets, the drop into the final
 *    fight, the fight itself. With the first rung alone ticked the reference
 *    has nothing to say (its switch is all-or-nothing) but the file would be
 *    stuck behind rules it can never meet, so those three relax onto the hammer
 *    exactly as the reference's swordless branch does. It is a mask, not a
 *    rewrite: ticking a beam rung back on gives every requirement straight back.
 *
 * The mail family is absent from the tier map on purpose: its tiers are classed
 * useful, not progression, so the reference never expands a mail pickup into
 * one and neither does this.
 */
import { PROGRESSION_TIERS } from '../item-names.data';
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { DEFAULT_PROGRESSIVE_MODES } from './progressive-modes.data';
import type { ApWorld } from '../world.type';
import type { ProgressiveFamilyId, ProgressiveModeSetting, ProgressiveSetting } from './progressive.type';

/** The pool item each family ships, plus the alternate spelling of the bow row. */
const FAMILY_OF_POOL_ITEM: ReadonlyMap<string, ProgressiveFamilyId> = new Map([
  ...PROGRESSIVE_FAMILIES.map((family): [string, ProgressiveFamilyId] => [family.poolItem, family.id]),
  ['Progressive Bow (Alt)', 'bow' as ProgressiveFamilyId],
]);

/** A world built before the rows existed reads as every tier ticked. */
const progressiveSettingOf = (world: ApWorld): ProgressiveSetting =>
  world.options.progressiveTiers ?? DEFAULT_PROGRESSIVE_SETTING;

/** A world built before the mode rows existed reads as every family in order. */
const progressiveModesOf = (world: ApWorld): ProgressiveModeSetting =>
  world.options.progressiveModes ?? DEFAULT_PROGRESSIVE_MODES;

/** The indices still on the ladder, in climb order. */
const tickedIndexesOf = (setting: ProgressiveSetting, family: ProgressiveFamilyId): readonly number[] => {
  const ticks = setting[family];
  const kept: number[] = [];
  ticks.forEach((ticked, index) => { if (ticked) kept.push(index); });
  return kept;
};

/** How many copies of the family's pool item a seed carries. */
const tickedCountOf = (setting: ProgressiveSetting, family: ProgressiveFamilyId): number =>
  tickedIndexesOf(setting, family).length;

/**
 * The tier names a pickup climbs, per pool item. Built off the reference map so
 * a family it never listed (the mail row) stays unlisted here too.
 */
const progressiveTierMapOf = (setting: ProgressiveSetting): ReadonlyMap<string, readonly string[]> =>
  new Map([...PROGRESSION_TIERS].map(([item, tiers]) => {
    const family = FAMILY_OF_POOL_ITEM.get(item);
    if (family === undefined) return [item, tiers];
    return [item, tickedIndexesOf(setting, family).map((index) => tiers[index]).filter((tier) => tier !== undefined)];
  }));

/** Can a blade be held at all in this seed? False is the reference's swordless setting. */
const swordReachable = (setting: ProgressiveSetting): boolean => tickedCountOf(setting, 'sword') > 0;

/** Can a beam blade be held? Only the second rung and up throw one. */
const beamSwordReachable = (setting: ProgressiveSetting): boolean =>
  tickedIndexesOf(setting, 'sword').some((index) => index >= 1);

const isSwordless = (world: ApWorld): boolean => !swordReachable(progressiveSettingOf(world));

const isBeamless = (world: ApWorld): boolean => !beamSwordReachable(progressiveSettingOf(world));

export {
  FAMILY_OF_POOL_ITEM,
  beamSwordReachable,
  isBeamless,
  isSwordless,
  progressiveModesOf,
  progressiveSettingOf,
  progressiveTierMapOf,
  swordReachable,
  tickedCountOf,
  tickedIndexesOf,
};
