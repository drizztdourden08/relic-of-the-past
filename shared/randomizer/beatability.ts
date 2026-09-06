/* @layer shared-game @kind logic */
/**
 * Placement verification: simulate a full playthrough from an empty inventory
 * and confirm every randomized check can be collected (the 'items'
 * accessibility guarantee). The spheres double as the spoiler log.
 */
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { ResolvedRules } from '@shared/game/logic/resolver';
import type { SpoilerSphere } from './placement.type';
import { sphereWalk } from './fill/reachability';

interface VerifyResult {
  beatable: boolean;
  spheres: SpoilerSphere[];
  /** Assigned check ids the walk never reached. */
  unreached: string[];
}

const verifyPlacement = (
  assignments: ReadonlyMap<CheckId, ItemId>,
  checks: readonly CheckRecord[],
  rules: ResolvedRules,
): VerifyResult => {
  const walk = sphereWalk({ assignments, checks, startInventory: new Set(), rules });
  const unreached = [...assignments.keys()].filter((id) => !walk.completedChecks.has(id));
  return { beatable: walk.collectedAll, spheres: walk.spheres, unreached };
};

export { verifyPlacement };
export type { VerifyResult };
