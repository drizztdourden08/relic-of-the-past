/* @layer bridge-wasm @kind logic */
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';
import { TARGET_FIELDS } from './foreign-icon-plan.constants';
import type { ForeignIconIdOf } from './foreign-icon-plan.type';

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
export type { ForeignIconIdOf } from './foreign-icon-plan.type';
