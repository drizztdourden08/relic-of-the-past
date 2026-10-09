/* @layer bridge-wasm @kind logic */
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
