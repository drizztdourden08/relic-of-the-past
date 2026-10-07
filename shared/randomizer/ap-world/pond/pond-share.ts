/* @layer shared-game @kind logic */
/**
 * One switch, three ponds. With it on, the three fairies are configured once:
 * every pond reads the capacity pond's rows, so a player who wants the same
 * ladder and the same demands at all three sets them in one block instead of
 * three. With it off, each pond keeps the rows it was given.
 *
 * THE RESOLUTION LIVES HERE AND NOWHERE ELSE. The generator, the access rules
 * and the options panel all read the effective settings through this one
 * function (pond-profiles-from-snapshot.ts), so none of them can roll or show
 * a pond the other two do not.
 *
 * A pond's own rows are never rewritten: sharing is a READING, so turning the
 * switch back off hands every pond the settings it always had.
 *
 * A snapshot with no row here reads as off, which is the only thing three
 * separately configured ponds could have meant before the switch existed.
 */
import { CAPACITY_POND, POND_IDS } from './pond-instances.data';
import type { ApOptionValue } from '../options.type';
import type { PondProfiles } from './pond-profiles.type';

/** The one row: a switch over all three ponds, not a row of any one of them. */
const POND_SHARE_KEY = 'pond_share';

const readsPondShare = (values: Readonly<Record<string, ApOptionValue | undefined>>): boolean =>
  values[POND_SHARE_KEY] === true;

/** Every pond as the seed reads it: its own setting, or the capacity pond's while sharing. */
const effectivePondProfiles = (profiles: PondProfiles, shared: boolean): PondProfiles => {
  if (!shared) return profiles;
  const shown = profiles[CAPACITY_POND.id];
  return Object.fromEntries(POND_IDS.map((id) => [id, shown])) as PondProfiles;
};

export { POND_SHARE_KEY, effectivePondProfiles, readsPondShare };
