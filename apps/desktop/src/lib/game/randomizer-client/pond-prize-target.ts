/* @layer bridge-wasm @kind logic */
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
