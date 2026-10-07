/* @layer bridge-wasm @kind logic */
/**
 * Offline mirror of session arming: the check ids a session WOULD physically
 * arm for this placement. apply-overrides.ts allocates a fire id for exactly
 * the fire-reported plan classes, so classifying the placement the same way
 * names the same checks, letting an offline read apply the identical
 * real-bit-vs-possession-proxy routing the live poller uses without a
 * session ever having started.
 */
import { buildPhysicalPlan } from './placement-bridge';
import { FIRE_REPORTED_CLASSES } from './fire-reported-classes';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const armedCheckIdsOfPlacement = (placement: Placement): ReadonlySet<string> => {
  const armed = new Set<string>();
  for (const entry of buildPhysicalPlan(placement).entries) {
    if (entry.checkId !== undefined && FIRE_REPORTED_CLASSES.has(entry.planClass)) {
      armed.add(entry.checkId);
    }
  }
  return armed;
};

export { armedCheckIdsOfPlacement };
