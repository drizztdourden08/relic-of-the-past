/* @layer bridge-wasm @kind logic */
/**
 * The plan with each foreign item armed as its icon id instead of the plain sentinel, so the
 * hold-up shows the icon of the game the item belongs to (core/game-hooks/foreign_icon.c).
 * The plan is classified once, with the sentinel, like any placement; this swaps only the
 * target id of the foreign rows, whatever table they arm in. With no resolver (a local seed,
 * or pictures the core did not take) the plan is returned as it came.
 */
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';

/** location → the icon id its foreign item is armed as; undefined keeps the sentinel. */
type ForeignIconIdOf = (location: LocationKey) => number | undefined;

/** The entry fields that carry a target id, one per substitution table. */
const TARGET_FIELDS = [
  'target', 'npcOverride', 'dropOverride', 'standingOverride', 'scriptedOverride', 'shopOverride',
] as const;

const withTargetId = (entry: PlanEntry, id: number): PlanEntry => {
  const next: PlanEntry = entry.targetLocalId === undefined ? { ...entry } : { ...entry, targetLocalId: id };
  for (const field of TARGET_FIELDS) {
    const table = entry[field];
    if (table !== undefined) Object.assign(next, { [field]: { ...table, targetLocalId: id } });
  }
  return next;
};

const withForeignIcons = (plan: PhysicalPlan, iconIdOf: ForeignIconIdOf | undefined): PhysicalPlan => {
  if (iconIdOf === undefined) return plan;
  const entries = plan.entries.map((entry) => {
    const id = isForeignItem(entry.item) ? iconIdOf(entry.location) : undefined;
    return id === undefined ? entry : withTargetId(entry, id);
  });
  return { ...plan, entries };
};

export { withForeignIcons };
export type { ForeignIconIdOf };
