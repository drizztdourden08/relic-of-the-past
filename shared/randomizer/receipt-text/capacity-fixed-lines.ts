/* @layer shared-game @kind logic */
/**
 * The receipt lines of a FIXED-JUMP capacity plan (the progressive switch
 * off). A fixed item carries its jump, but the capacity it climbs from is
 * only known in the core at grant time — the shuffle decides the order the
 * copies are found in — so the session pre-renders one line per (item jump,
 * possible starting rung) and the core selects by the live rung when the
 * grant resolves (capacity_fixed_lines.c). The counted families and the
 * meter can stand on any rung below their top (a locked pond's native step
 * moves them off-plan), so every rung is a candidate start; the wallet has
 * no native step, so only the sums the plan's own jumps can reach are.
 */
import { FAMILIES } from '../ap-world/capacity/capacity-family';
import { maxTierOf, planOf, startTierOf } from '../ap-world/capacity/family-plan';
import { renderCapacityStep } from './capacity-rung-values';
import type { CapacityFamilyId, CapacityProfile } from '../ap-world/capacity/capacity-profile.type';
import type { ReceiptLine } from './receipt-line.type';

interface CapacityFixedLine {
  family: CapacityFamilyId;
  /** The rung the family stands on when the item lands. */
  fromRung: number;
  /** The item's jump in rungs; the climb ends at fromRung + jump. */
  jump: number;
  line: ReceiptLine;
}

/** The rungs a fixed pickup can start from, below the plan's top. */
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

/** Every (jump, starting rung) line of the Custom families; [] when no family is Custom. */
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
export type { CapacityFixedLine };
