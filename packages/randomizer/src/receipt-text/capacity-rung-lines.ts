/* @layer shared-game @kind logic */
import { FAMILIES } from '../world/capacity/capacity-family';
import { maxTierOf, planOf, startTierOf } from '../world/capacity/family-plan';
import { renderCapacityStep } from './capacity-rung-values';
import type { CapacityProfile } from '../world/capacity/capacity-profile.type';
import type { CapacityRungLines } from './capacity-lines.type';

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
