/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import { decomposeRupees, describeRupees, rupeeVolleysOf } from '@shared/randomizer/world/pond/rupee-gems';
import { LEGACY_POND_SETTING } from '@shared/randomizer/world/pond/pond-profile-defaults';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import { CUSTOM } from './pond-model.constants';

describe('rupee decomposition', () => {
  it('names the gems the amount is made of', () => {
    expect(describeRupees(300)).toBe('1 gold');
    expect(describeRupees(427)).toBe('1 gold, 1 silver, 1 red, 1 blue, 2 green');
    expect(describeRupees(999)).toBe('3 gold, 1 violet, 2 red, 1 blue, 4 green');
    expect(describeRupees(1)).toBe('1 green');
    expect(describeRupees(5)).toBe('1 blue');
  });

  it('always adds back up to the amount', () => {
    for (let amount = 0; amount <= 9999; amount += 1) {
      const total = decomposeRupees(amount).reduce((sum, gem) => sum + gem.value, 0);
      expect(total, `amount ${amount}`).toBe(amount);
    }
  });

  it('groups the gems into volleys that share one decoded sheet', () => {
    expect(rupeeVolleysOf(999).map((volley) => volley.length)).toEqual([3, 1, 7]);
    expect(rupeeVolleysOf(300).map((volley) => volley.length)).toEqual([1]);
    const pondGemSlots = 10;
    for (let amount = 0; amount <= 9999; amount += 7) {
      for (const volley of rupeeVolleysOf(amount)) {
        expect(volley.length).toBeLessThanOrEqual(pondGemSlots);
        expect(new Set(volley.map((gem) => gem.decodeKey)).size).toBe(1);
      }
    }
  });
});

describe('pond plan', () => {
  it('leaves the legacy pond with nothing to sell', () => {
    const plan = pondPlanOf(LEGACY_POND_SETTING);
    expect(plan.throws).toEqual([]);
    expect(plan.locations).toEqual([]);
  });

  it('vanilla cost is fourteen throws of a hundred', () => {
    const plan = pondPlanOf({ mode: 'vanilla-cost', items: 2 });
    expect(plan.throws).toHaveLength(14);
    expect(plan.throws.every((entry) => entry.price === 100)).toBe(true);
    expect(plan.totalPrice).toBe(1400);
    expect(plan.locations).toEqual(['slot-pond-capacity-1', 'slot-pond-capacity-2']);
    expect(plan.throws.map((entry) => entry.prize).slice(0, 3)).toEqual([0, 1, -1]);
  });

  it('custom cuts the price ladder with the curve', () => {
    const plan = pondPlanOf(CUSTOM);
    expect(plan.throws.map((entry) => entry.price)).toEqual([100, 150, 200, 250, 300]);
    expect(plan.locations).toHaveLength(3);
    expect(plan.worstPriceOfPrize).toEqual([100, 150, 200]);
  });

  it('custom with zero items is not a check source', () => {
    const plan = pondPlanOf({ ...CUSTOM, items: 0 } as PondSetting);
    expect(plan.locations).toEqual([]);
    expect(plan.throws.every((entry) => entry.prize === -1)).toBe(true);
  });

  it('no mode pays a losing throw anything back', () => {
    for (const setting of [{ mode: 'vanilla-cost', items: 2 }, CUSTOM] as PondSetting[]) {
      for (const entry of pondPlanOf(setting).throws) expect(entry.refund).toBe(0);
    }
  });

  it('the wallet reading of a prize is the worst case, never the last price', () => {
    const plan = pondPlanOf(CUSTOM);
    plan.locations.forEach((_, prize) => {
      const at = plan.throws.findIndex((entry) => entry.prize === prize);
      const dearest = Math.max(...plan.throws.slice(0, at + 1).map((entry) => entry.price));
      expect(plan.worstPriceOfPrize[prize]).toBe(dearest);
    });
  });
});
