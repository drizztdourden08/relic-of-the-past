/* @layer shared-game @kind types */
/**
 * How generous a seed is with the things a file can hold more than one of.
 *
 * The reference project asks this as ONE four-step choice (Options.py
 * ItemPool: easy / normal / hard / expert), and that choice bundles two
 * questions that have nothing to do with each other. Its easy step DUPLICATES
 * copies — eight blades where normal has four, six shields where normal has
 * three — while its hard and expert steps LOWER THE CEILING, stopping a family
 * short of its best rung and thinning the hearts. A player who wants twice as
 * many blades to find has no way to say so without also being handed twice as
 * many shields, twice as much armour and twice the bottles.
 *
 * So the question is asked apart here, per family, and the ceiling half of it
 * is not asked at all: which rungs a family carries is already the tier ticks'
 * question (progressive/), answered per rung on the same screen. What is left
 * is the two things nothing else asks:
 *
 *  - HOW MANY COPIES each tiered family puts in the seed, as a multiple of
 *    what it normally carries. Normal is the reference pool, byte for byte;
 *    double and triple multiply the copies the shuffle really carries, and
 *    each extra copy displaces one filler item so the fill stays one item per
 *    open location;
 *  - HOW HIGH the hearts climb. Twenty is the ceiling the game itself enforces
 *    (the container receipt refuses to raise capacity past 0xa0) and also
 *    exactly what the untouched pool adds up to, so twenty is both the default
 *    and the maximum; three is a file's own starting hearts, so it is the
 *    floor.
 */
import type { ProgressiveFamilyId } from '../progressive/progressive.type';

/** How many times over a family's copies are put in the seed. */
type CopyMultiplier = 1 | 2 | 3;

/** One multiplier per tiered family — the whole copies half of the setting. */
type CopyMultiplierSetting = Readonly<Record<ProgressiveFamilyId, CopyMultiplier>>;

/** The whole difficulty setting a seed is generated under. */
interface DifficultySetting {
  /** How many copies of each tiered family the seed carries, as a multiple. */
  copies: CopyMultiplierSetting;
  /** The most hearts a file may ever reach, the three it starts with included. */
  heartCap: number;
}

export type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting };
