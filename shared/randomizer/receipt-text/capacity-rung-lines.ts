/* @layer shared-game @kind logic */
/**
 * The per-rung receipt lines of a progressive plan. A progressive item's
 * jump is only known when it lands (the plan entry the family's reached rung
 * points at), so the session pre-renders ONE line per planned rung per
 * Custom family, in plan order, and the core picks line k when the k-th
 * pickup resolves. Each line carries the climb's numbers: the tiers jumped,
 * the capacity before and after, and the plan's final maximum
 * (capacity-rung-values.ts), where the from and to values of rung k are the plan's
 * cumulative rungs k and k+1.
 */
import { FAMILIES } from '../ap-world/capacity/capacity-family';
import { maxTierOf, planOf, startTierOf } from '../ap-world/capacity/family-plan';
import { renderCapacityStep } from './capacity-rung-values';
import type { CapacityFamilyId, CapacityProfile } from '../ap-world/capacity/capacity-profile.type';
import type { ReceiptLine } from './receipt-line.type';

interface CapacityRungLines {
  family: CapacityFamilyId;
  /** One line per planned jump, in plan order: index k is the k-th pickup's line. */
  lines: readonly ReceiptLine[];
}

/** The Custom families' rung lines; [] when no family is Custom (nothing to pre-render). */
const capacityRungLinesOf = (profile: CapacityProfile): CapacityRungLines[] =>
  FAMILIES.flatMap((capacityFamily) => {
    const setting = profile[capacityFamily.id];
    if (setting.mode !== 'custom') return [];
    const { jumps } = planOf(capacityFamily, setting);
    const maxRung = maxTierOf(capacityFamily, setting);
    let rung = startTierOf(capacityFamily, setting);
    const lines = jumps.map((jump) => {
      const fromRung = rung;
      rung += jump;
      return renderCapacityStep(capacityFamily.id, fromRung, rung, maxRung);
    });
    return [{ family: capacityFamily.id, lines }];
  });

export { capacityRungLinesOf };
export type { CapacityRungLines };
