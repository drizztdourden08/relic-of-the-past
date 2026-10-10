/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { baselineValues, parsePondSetting, pondPlanOf, rollPondDemands, POND_ASK_ROW_BY_KIND, pondRupeesOnlyAsk, curvePositionsOf, POND_INSTANCE_BY_ID, REFERENCE_CAPACITY_PROFILE, createRng } from '@rotp/randomizer';
import type { CurveId, PondAskAmountKind, PondAskSetting, PondSetting } from '@rotp/randomizer';
import { CURVES } from './pond-model.constants';

describe('one ramp per demand', () => {
  const pondOf = (curve: CurveId): PondSetting =>
    ({ mode: 'custom', start: 0, max: 999, throws: 10, items: 10, shape: { curve } });
  const amountOf = (demand: unknown): number => (demand as { amount: number }).amount;

  const oneKind = (kind: PondAskAmountKind, min: number, max: number): PondAskSetting => ({
    ...pondRupeesOnlyAsk(0, 999),
    rupees: { enabled: kind === 'rupees', min: 0, max: 999 },
    ...(kind === 'bottle'
      ? { bottle: { enabled: true, min, max, contents: ['fairy'] as const } }
      : kind === 'rupees' ? {} : { [kind]: { enabled: true, min, max } }),
  });

  it('every kind reaches its own two ends at the same two rungs', () => {
    for (const curve of CURVES) {
      const plan = pondPlanOf(pondOf(curve), POND_INSTANCE_BY_ID.capacity);
      const ends: [PondAskAmountKind, number, number][] = [
        ['rupees', 0, 999], ['bombs', 1, 10], ['arrows', 1, 30], ['bottle', 1, 4],
      ];
      for (const [kind, min, max] of ends) {
        const view = rollPondDemands(
          plan, oneKind(kind, min, max), { curve }, createRng('ramp'), REFERENCE_CAPACITY_PROFILE, []);
        const amounts = plan.locations.map((name) => amountOf(view[name]));
        expect([amounts[0], amounts[amounts.length - 1]], `${curve} ${kind}`).toEqual([min, max]);
        const { stops } = POND_ASK_ROW_BY_KIND[kind];
        amounts.forEach((amount, index) => {
          expect(stops, `${curve} ${kind}`).toContain(amount);
          if (index > 0) expect(amount, `${curve} ${kind}`).toBeGreaterThanOrEqual(amounts[index - 1]);
        });
      }
    }
  });

  it('a rupee demand is the throw price, and the position is the walk down the ladder', () => {
    for (const curve of CURVES) {
      const plan = pondPlanOf(pondOf(curve), POND_INSTANCE_BY_ID.capacity);
      const view = rollPondDemands(
        plan, pondRupeesOnlyAsk(0, 999), { curve }, createRng('price'), REFERENCE_CAPACITY_PROFILE, []);
      expect(plan.locations.map((name) => amountOf(view[name])), curve)
        .toEqual(plan.throws.map((entry) => entry.price));
      const positions = curvePositionsOf(plan, { curve });
      expect([positions[0], positions[positions.length - 1]], curve).toEqual([0, 1]);
    }
  });

  it('the bottle demand carries a count, one by default and never past four', () => {
    const plan = pondPlanOf(pondOf('equal'), POND_INSTANCE_BY_ID.capacity);
    const fresh = parsePondSetting(baselineValues).setting;
    expect(fresh.mode === 'custom' && fresh.ask).toBeUndefined();
    const single = rollPondDemands(
      plan, oneKind('bottle', 1, 1), { curve: 'equal' }, createRng('one'), REFERENCE_CAPACITY_PROFILE, []);
    expect(plan.locations.map((name) => single[name])).toEqual(
      plan.locations.map(() => ({ currency: 'bottle', amount: 1, content: 'fairy' })));
    const wide = rollPondDemands(
      plan, oneKind('bottle', 1, 4), { curve: 'equal' }, createRng('wide'), REFERENCE_CAPACITY_PROFILE, []);
    for (const name of plan.locations) {
      expect(amountOf(wide[name])).toBeGreaterThanOrEqual(1);
      expect(amountOf(wide[name])).toBeLessThanOrEqual(4);
    }
  });
});
