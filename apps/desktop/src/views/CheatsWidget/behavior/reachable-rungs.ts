/* @layer renderer-widgets @kind logic */
import { familyById, planOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilySetting } from '@rotp/randomizer';
import type { ActiveCapacity } from '@rotp/randomizer';
import type { CapacityKind } from '@app/game';
import { FAMILY_OF_KIND, VANILLA_METER_RUNGS } from '../CheatsWidget.constants';

const subsetRungs = (base: number, jumps: readonly number[], top: number): Set<number> => {
  let reach = new Set<number>([base]);
  for (const jump of jumps) {
    const next = new Set(reach);
    for (const rung of reach) next.add(Math.min(top, rung + jump));
    reach = next;
  }
  return reach;
};

const climbRungs = (family: CapacityFamily, setting: FamilySetting): Set<number> =>
  new Set(planOf(family, setting).ladder.map((value) => family.ladder.indexOf(value)).filter((rung) => rung >= 0));

const vanillaRungs = (family: CapacityFamily): Set<number> => {
  if (family.id === 'wallet') return new Set([family.vanillaRung]);
  if (family.id === 'meter') return new Set(VANILLA_METER_RUNGS);
  const top = family.ladder.length - 1;
  return new Set(Array.from({ length: top - family.vanillaRung + 1 }, (_, i) => family.vanillaRung + i));
};

const reachableRungsOf = (kind: CapacityKind, active: ActiveCapacity | null): ReadonlySet<number> | null => {
  if (!active) return null;
  const family = familyById(FAMILY_OF_KIND[kind]);
  const setting = active.profile[family.id];
  const top = family.ladder.length - 1;
  if (setting.mode === 'vanilla') return vanillaRungs(family);
  if (setting.mode === 'vanilla-in-pool') return subsetRungs(family.vanillaRung, family.referenceJumps, top);
  if (active.progressive) return climbRungs(family, setting);
  const { jumps } = planOf(family, setting);
  return subsetRungs(family.indexOf(setting.start), jumps, family.indexOf(setting.max));
};

export { reachableRungsOf };
