/* @layer bridge-wasm @kind logic */
/**
 * The scripted-grant slot a pond prize location arms, or null when the
 * location is no pond's prize. Two kinds of pond hand prizes over in ORDER
 * from a table of their own, so both are keyed by position and never by a
 * check record, since most of their slots have none:
 *
 *   the capacity pond: the prize ordinal its throw schedule hands over.
 *   a wish pond:       the water and the rung of its sequence.
 *
 * A wish pond at its native economy is neither: its prizes are its own two
 * fairy slots, which are ordinary npc checks and classify as such.
 */

import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides';
import type { ScopeFlags } from './scope-lock';

const pondPrizeTargetOf = (location: LocationKey, flags: ScopeFlags): ScriptedGrantSurface | null => {
  const { pondPrizeLocations, wishPondRungs } = flags;
  const prize = pondPrizeLocations?.indexOf(location) ?? -1;
  if (prize >= 0) return { surface: 'pond', prize };
  const rung = wishPondRungs?.get(location);
  return rung === undefined ? null : { surface: 'wish-pond', ...rung };
};

export { pondPrizeTargetOf };
