/* @layer shared-game @kind logic */
import { FAMILIES } from '../world/capacity/capacity-family';
import { maxTierOf, planOf, startTierOf } from '../world/capacity/family-plan';
import { renderCapacityStep } from './capacity-rung-values';
import type { CapacityFamilyId, CapacityProfile } from '../world/capacity/capacity-profile.type';
import type { CapacityFixedLine } from './capacity-lines.type';

const startRungsOf = (
  family: CapacityFamilyId, start: number, max: number, jumps: readonly number[],
): number[] => {
  if (family !== 'wallet') return Array.from({ length: max - start }, (_, offset) => start + offset);
  const sums = new Set<number>([start]);
  for (const jump of jumps) {
    for (const sum of [...sums]) if (sum + jump <= max) sums.add(sum + jump);
  }
  return [...sums].filter((rung) => rung < max).sort((a, b) => a - b);
};

const capacityFixedLinesOf = (profile: CapacityProfile): CapacityFixedLine[] =>
  FAMILIES.flatMap((capacityFamily) => {
    const setting = profile[capacityFamily.id];
    if (setting.mode !== 'custom') return [];
    const { jumps } = planOf(capacityFamily, setting);
    const start = startTierOf(capacityFamily, setting);
    const max = maxTierOf(capacityFamily, setting);
    const distinct = [...new Set(jumps)].sort((a, b) => a - b);
    return startRungsOf(capacityFamily.id, start, max, jumps).flatMap((fromRung) =>
      distinct.filter((jump) => fromRung + jump <= max).map((jump): CapacityFixedLine => ({
        family: capacityFamily.id,
        fromRung,
        jump,
        line: renderCapacityStep(capacityFamily.id, fromRung, fromRung + jump, max),
      })));
  });

export { capacityFixedLinesOf };
