/* @layer tests @kind test */
/**
 * The pond model: the rupee decomposition, the modes' schedules, the snapshot
 * adapter (a snapshot with no pond row means the legacy pond, and so does a
 * mode the model no longer offers), the wallet reading of a prize, and the
 * pond's own receipt lines: the price of a toss, a prize award, an emptied
 * pond, which have to quote the plan's real amounts, because every vanilla
 * line they replace names an amount no plan charges or asks a question no
 * plan puts. And the item demand: which names it may pick, the order its
 * curve climbs, and what a pond with nothing to name falls back to.
 */
import { describe, expect, it } from 'vitest';
import { apBaselineValues } from '@shared/randomizer/ap-world/options.data';
import { parsePondSetting, pondValuesOf } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { decomposeRupees, describeRupees, rupeeVolleysOf } from '@shared/randomizer/ap-world/pond/rupee-gems';
import { DEFAULT_POND_SETTING, LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import {
  POND_AWARD_LAST_LINE, POND_AWARD_MORE_LINE, POND_CLOSED_LINE, pondLinesOf,
} from '@shared/randomizer/receipt-text/pond-lines';
import { receiptLineCandidates } from '@shared/randomizer/receipt-text/receipt-line.type';
import { isDemandableItem } from '@shared/randomizer/ap-world/pond/pond-demand-eligibility';
import { DEMAND_ITEM_ORDER } from '@shared/randomizer/ap-world/pond/pond-demand-order.data';
import { demandCandidatesOf } from '@shared/randomizer/ap-world/pond/pond-demand-item';
import { rollPondDemands } from '@shared/randomizer/ap-world/pond/pond-demand-roll';
import { POND_ASK_ROW_BY_KIND, pondRupeesOnlyAsk } from '@shared/randomizer/ap-world/pond/pond-ask.data';
import { curvePositionsOf } from '@shared/randomizer/ap-world/pond/pond-demand-ramp';
import { POND_INSTANCE_BY_ID } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { REFERENCE_CAPACITY_PROFILE } from '@shared/randomizer/ap-world/capacity/capacity-profile-defaults';
import { ALL_ITEMS } from '@shared/game/data/items';
import { createRng } from '@shared/randomizer/rng';
import type { CurveId } from '@shared/randomizer/ap-world/capacity/capacity-profile.type';
import type { PondAskAmountKind, PondAskSetting } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';

const CUSTOM: PondSetting = {
  mode: 'custom', start: 100, max: 300, throws: 5, items: 3, shape: { curve: 'equal' },
};

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
    // 999 = 3 gold · 1 violet · (2 red + 1 blue + 4 green); the small values share a sheet.
    expect(rupeeVolleysOf(999).map((volley) => volley.length)).toEqual([3, 1, 7]);
    expect(rupeeVolleysOf(300).map((volley) => volley.length)).toEqual([1]);
    // Never more than the pond's ten slots in one volley.
    for (let amount = 0; amount <= 9999; amount += 7) {
      for (const volley of rupeeVolleysOf(amount)) {
        expect(volley.length).toBeLessThanOrEqual(10);
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
    expect(plan.locations).toEqual(['Hylia Fairy 1', 'Hylia Fairy 2']);
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

describe('pond receipt lines', () => {
  /** The longest candidate that still shows without scrolling the box (measured at 164px). */
  const LONGEST_FITTING = 63;

  it('allocates one line per distinct price, then the award and closing lines', () => {
    // Vanilla cost charges the same hundred fourteen times and never pays back.
    const flat = pondLinesOf(pondPlanOf({ mode: 'vanilla-cost', items: 2 }));
    expect(flat.prices).toEqual([100]);
    expect(flat.refunds).toEqual([]);
    expect(flat.lines).toHaveLength(4);
    expect(flat.lines[flat.lines.length - 3]).toBe(POND_AWARD_MORE_LINE);
    expect(flat.lines[flat.lines.length - 2]).toBe(POND_AWARD_LAST_LINE);
    expect(flat.lines[flat.lines.length - 1]).toBe(POND_CLOSED_LINE);

    const custom = pondLinesOf(pondPlanOf(CUSTOM));
    expect(custom.prices).toEqual([100, 150, 200, 250, 300]);
    expect(custom.lines).toHaveLength(8);
  });

  it('the award lines differ only in what they say about what is left', () => {
    const more = receiptLineCandidates(POND_AWARD_MORE_LINE);
    const last = receiptLineCandidates(POND_AWARD_LAST_LINE);
    expect(more).toHaveLength(last.length);
    expect(more.some((candidate) => /more/i.test(candidate))).toBe(true);
    expect(last.every((candidate) => /last|empty/i.test(candidate))).toBe(true);
  });

  it('quotes the amounts of the throws it was built from', () => {
    const plan = pondPlanOf(CUSTOM);
    const { prices, lines } = pondLinesOf(plan);
    expect(prices).toEqual(plan.throws.map((entry) => entry.price));
    prices.forEach((price, index) => {
      for (const candidate of receiptLineCandidates(lines[index])) {
        expect(candidate, `price ${price}`).toContain(String(price));
      }
    });
  });

  it('a free throw does not quote a price of zero', () => {
    const free = pondLinesOf(pondPlanOf(
      { mode: 'custom', start: 0, max: 0, throws: 1, items: 1, shape: { curve: 'equal' } }));
    for (const candidate of receiptLineCandidates(free.lines[0])) {
      expect(candidate).not.toContain('0 rupees');
      expect(candidate.toLowerCase()).toMatch(/free|house/);
    }
  });

  it('keeps a shortest candidate the text box can always show', () => {
    // The composer keeps the fullest candidate that fits three rows and falls back down
    // the list, so the LAST one has to fit at every amount the ladder can reach.
    const plan = pondPlanOf({ ...CUSTOM, start: 0, max: 999, throws: 19 } as PondSetting);
    const lines = [...pondLinesOf(plan).lines, POND_AWARD_MORE_LINE, POND_AWARD_LAST_LINE, POND_CLOSED_LINE];
    for (const line of lines) {
      const candidates = receiptLineCandidates(line);
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[candidates.length - 1].length).toBeLessThanOrEqual(LONGEST_FITTING);
    }
  });
});

describe('pond snapshot adapter', () => {
  it('reads a snapshot with no pond row as the legacy pond', () => {
    const values = { ...apBaselineValues };
    delete (values as Record<string, unknown>)['pond_capacity_mode'];
    expect(parsePondSetting(values).setting).toEqual(LEGACY_POND_SETTING);
  });

  it('the shipped baseline is the fresh-profile pond', () => {
    expect(parsePondSetting(apBaselineValues).setting).toEqual(DEFAULT_POND_SETTING);
  });

  it('round-trips every mode', () => {
    for (const setting of [LEGACY_POND_SETTING, { mode: 'vanilla-cost', items: 5 }, CUSTOM] as PondSetting[]) {
      expect(parsePondSetting(pondValuesOf(setting)).setting).toEqual(setting);
    }
  });

  it('a mode the model no longer offers reads as the legacy pond, with a note', () => {
    const parsed = parsePondSetting({ ...pondValuesOf(CUSTOM), pond_capacity_mode: 'gamble' });
    expect(parsed.setting).toEqual(LEGACY_POND_SETTING);
    expect(parsed.notes).toContain('Hylia Fairy: unknown mode gamble, using the vanilla pond');
  });

  it('reports every fallback it applies', () => {
    const parsed = parsePondSetting({
      ...pondValuesOf(CUSTOM), pond_capacity_ask_rupees_min: 300, pond_capacity_ask_rupees_max: 100,
    });
    expect(parsed.notes.length).toBeGreaterThan(0);
    expect(parsed.setting).toMatchObject({ mode: 'custom', start: 300, max: 300 });
  });
});

describe('pond held to the wallet', () => {
  const walletTo = (top: string) => ({
    capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: top, capacity_wallet_count: 1,
  });

  it('pulls a custom range down to the highest price the wallet holds', () => {
    const parsed = parsePondSetting({ ...pondValuesOf({ ...CUSTOM, start: 200, max: 999 }), ...walletTo('599') });
    expect(parsed.setting).toMatchObject({ mode: 'custom', start: 200, max: 500 });
    expect(parsed.notes)
      .toContain('Hylia Fairy: the wallet tops out at 599, so the price range is held at 500');
    const start = parsePondSetting({ ...pondValuesOf({ ...CUSTOM, start: 900, max: 999 }), ...walletTo('599') });
    expect(start.setting).toMatchObject({ mode: 'custom', start: 500, max: 500 });
  });

  it('leaves the fixed schedule alone: the wallet floor puts every top above it', () => {
    // Vanilla cost tops out at a hundred, and no reachable wallet sits below
    // 599 (capacity/wallet-floor.ts), so it can never be held.
    const vanilla = parsePondSetting({ ...pondValuesOf({ mode: 'vanilla-cost', items: 2 }), ...walletTo('599') });
    expect(vanilla.setting).toEqual({ mode: 'vanilla-cost', items: 2 });
    expect(vanilla.notes).toEqual([]);
    expect(pondPlanOf(vanilla.setting).totalPrice).toBe(1400);
  });

  it('leaves every setting untouched under a wallet that reaches its prices', () => {
    for (const setting of [{ mode: 'vanilla-cost', items: 5 }, { ...CUSTOM, max: 999 }] as PondSetting[]) {
      expect(parsePondSetting({ ...pondValuesOf(setting), ...walletTo('999') }).setting).toEqual(setting);
    }
    // The fixed schedule tops out at a hundred, which a 299 wallet reaches, so no ceiling is written.
    expect(parsePondSetting({ ...pondValuesOf({ mode: 'vanilla-cost', items: 5 }), ...walletTo('299') }).setting)
      .toEqual({ mode: 'vanilla-cost', items: 5 });
  });
});

describe('pond item demand', () => {
  const ITEM_ONLY = { ...pondRupeesOnlyAsk(100, 300), rupees: { enabled: false, min: 100, max: 300 }, item: { enabled: true } };
  const plan = pondPlanOf({ ...CUSTOM, items: 5 }, POND_INSTANCE_BY_ID.wishing);
  const roll = (pool: readonly string[], ask = ITEM_ONLY, seed = 'demand') =>
    rollPondDemands(plan, ask, { curve: 'equal' }, createRng(seed), REFERENCE_CAPACITY_PROFILE, pool);

  it('names only items the player holds and the core can test', () => {
    const held = ['Hookshot', 'Ether', 'Moon Pearl', 'Progressive Sword', 'Progressive Glove', 'Red Pendant', 'Crystal 3'];
    const never = [
      'Rupees (20)', 'Rupee (1)', 'Rupees (300)', 'Bombs (3)', 'Arrows (10)', 'Single Arrow', 'Piece of Heart',
      'Boss Heart Container', 'Sanctuary Heart Container', 'Progressive Bomb Capacity', 'Progressive Wallet',
      'Progressive Magic Capacity', 'Magic Upgrade (1/2)', 'Bottle', 'Bottle (Fairy)', 'Small Key (Ice Palace)',
      'Big Key (Desert Palace)', 'Map (Eastern Palace)', 'Compass (Turtle Rock)', 'Triforce Piece',
      'Master Sword', 'Titans Mitts', 'Silver Bow', 'Silver Arrows', 'Shovel', 'Flute', 'Mushroom', 'Blue Boomerang',
    ];
    for (const name of held) expect(isDemandableItem(name), name).toBe(true);
    for (const name of never) expect(isDemandableItem(name), name).toBe(false);
  });

  it('orders every eligible record, and orders nothing ineligible', () => {
    for (const name of DEMAND_ITEM_ORDER) expect(isDemandableItem(name), name).toBe(true);
    const eligible = new Set(ALL_ITEMS.map((item) => item.randomizerName).filter(isDemandableItem));
    for (const name of eligible) expect(DEMAND_ITEM_ORDER, name).toContain(name);
  });

  it('ranks the pool early to late, once each, and climbs that ranking', () => {
    const pool = ['Rupees (20)', 'Rupees (20)', 'Cane of Byrna', 'Lamp', 'Hammer', 'Piece of Heart', 'Moon Pearl', 'Lamp'];
    expect(demandCandidatesOf(pool)).toEqual(['Lamp', 'Moon Pearl', 'Hammer', 'Cane of Byrna']);
    for (let seed = 0; seed < 50; seed += 1) {
      const view = roll(pool, ITEM_ONLY, `climb-${seed}`);
      const names = plan.locations.map((rung) => view[rung]);
      expect(names[0]).toEqual({ currency: 'item', itemName: 'Lamp' });
      expect(names[names.length - 1]).toEqual({ currency: 'item', itemName: 'Cane of Byrna' });
    }
  });

  it('with nothing eligible, falls back to another ticked kind, then to a free rung', () => {
    const bare = ['Rupees (20)', 'Rupee (1)', 'Piece of Heart', 'Progressive Wallet'];
    expect(roll(bare)).toEqual({});
    const withBombs = roll(bare, { ...ITEM_ONLY, bombs: { enabled: true, min: 1, max: 5 } });
    expect(Object.values(withBombs).map((demand) => demand.currency)).toEqual(plan.locations.map(() => 'bombs'));
  });
});

describe('one ramp per demand', () => {
  const CURVES: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];
  const pondOf = (curve: CurveId): PondSetting =>
    ({ mode: 'custom', start: 0, max: 999, throws: 10, items: 10, shape: { curve } });
  const amountOf = (demand: unknown): number => (demand as { amount: number }).amount;

  /** One pond asking in one kind only, so every rung carries that kind. */
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
        // Monotone, and always a stop of that kind's own ladder.
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
    const fresh = parsePondSetting(apBaselineValues).setting;
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
