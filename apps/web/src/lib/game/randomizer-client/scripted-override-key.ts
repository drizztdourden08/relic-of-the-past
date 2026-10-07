/* @layer bridge-wasm @kind logic */
/**
 * Substitution keys for the scripted grants that never cross the receive
 * seam: the certified surfaces of core/game-hooks/scripted_grants.c. Each
 * is a singular, decomp-audited grant moment: the upgrade pond's two
 * capacity purchases (its handler's own once-per-level counter bumps), the
 * cave bat's meter write, and the prize minigame's once-only top roll (its
 * own chest routine, outside the native chest table). Keyed by check id so
 * the capability probe, the classifier and the arming switch always agree.
 */

import { getCheck } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides';

/** The certified scripted-grant surfaces, by check id. */
const SCRIPTED_SURFACE_BY_CHECK: ReadonlyMap<string, ScriptedGrantSurface> = new Map<string, ScriptedGrantSurface>([
  ['check-273', { surface: 'capacity', kind: 0 }], // the pond's explosives-capacity slot
  ['check-274', { surface: 'capacity', kind: 1 }], // the pond's projectiles-capacity slot
  ['check-040', { surface: 'bat' }],               // the cave bat's meter upgrade
  ['check-270', { surface: 'minigame', roomId: 262 }], // the prize minigame's top prize
]);

/**
 * The scripted-grant surface for one check, or null when the check's grant
 * is not one of the certified scripted surfaces.
 */
const scriptedOverrideKeyOf = (checkId: CheckId): ScriptedGrantSurface | null => {
  const surface = SCRIPTED_SURFACE_BY_CHECK.get(checkId);
  if (surface === undefined) return null;
  getCheck(checkId); // throws on an unknown id, so the table stays honest with the dataset
  return surface;
};

export { scriptedOverrideKeyOf };
