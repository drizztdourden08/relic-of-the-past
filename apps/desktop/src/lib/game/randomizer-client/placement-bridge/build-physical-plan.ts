/* @layer bridge-wasm @kind logic */
import { scopeFlagsOfStats } from '../plan-scope-flags';
import { classifyLocation } from './classify-location';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { PhysicalPlan, PlanEntry, PlanError } from '../physical-plan.type';

const isPlanError = (row: PlanEntry | PlanError): row is PlanError =>
  (row as PlanError).reason !== undefined;

const buildPhysicalPlan = (placement: Placement): PhysicalPlan => {
  const flags = { ...scopeFlagsOfStats(placement.stats), shopPrices: placement.shopPrices };
  const entries: PlanEntry[] = [];
  const errors: PlanError[] = [];
  for (const [where, item] of Object.entries(placement.locations)) {
    const location = where as LocationKey;
    const row = classifyLocation(location, item, flags);
    if (isPlanError(row)) errors.push(row);
    else entries.push(row);
  }
  const countOf = (planClass: PlanEntry['planClass']): number =>
    entries.filter((entry) => entry.planClass === planClass).length;
  const counts = {
    override: countOf('override'),
    overrideNpc: countOf('override-npc'),
    overrideDrop: countOf('override-drop'),
    overrideStanding: countOf('override-standing'),
    overrideScripted: countOf('override-scripted'),
    overrideShop: countOf('override-shop'),
    deliver: countOf('deliver'),
    vanillaLocked: countOf('vanilla-locked'),
    pollBlind: entries.filter((entry) =>
      entry.planClass === 'vanilla-locked' && entry.detection === undefined).length,
    errors: errors.length,
  };
  return { entries, errors, counts };
};

export { buildPhysicalPlan };
