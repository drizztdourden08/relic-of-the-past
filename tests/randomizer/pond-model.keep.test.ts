/* @layer tests @kind test */
/**
 * The pond model: the rupee decomposition, the three modes' schedules, the
 * snapshot adapter (a snapshot with no pond row means the legacy pond), the
 * wallet reading of a prize, and the pond's own three receipt lines: the
 * price of a toss, a throw that won nothing, an emptied pond, which have to
 * quote the plan's real amounts, because every vanilla line they replace
 * names an amount no plan charges.
 */
import { describe, expect, it } from 'vitest';
import { apBaselineValues } from '@shared/randomizer/ap-world/options.data';
import { parsePondSetting, pondValuesOf } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { decomposeRupees, describeRupees, rupeeVolleysOf } from '@shared/randomizer/ap-world/pond/rupee-gems';
import { POND_GAMBLE_CHANCES, gamblePriceOf } from '@shared/randomizer/ap-world/pond/pond-ladder.data';
import { DEFAULT_POND_SETTING, LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { POND_CLOSED_LINE, pondLinesOf } from '@shared/randomizer/receipt-text/pond-lines';
import { receiptLineCandidates } from '@shared/randomizer/receipt-text/receipt-line.type';
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
    const plan = pondPlanOf(LEGACY_POND_SETTING, 'seed');
    expect(plan.throws).toEqual([]);
    expect(plan.locations).toEqual([]);
  });

  it('vanilla cost is fourteen throws of a hundred', () => {
    const plan = pondPlanOf({ mode: 'vanilla-cost', items: 2 }, 'seed');
    expect(plan.throws).toHaveLength(14);
    expect(plan.throws.every((entry) => entry.price === 100)).toBe(true);
    expect(plan.totalPrice).toBe(1400);
    expect(plan.locations).toEqual(['Capacity Upgrade Left', 'Capacity Upgrade Right']);
    expect(plan.throws.map((entry) => entry.prize).slice(0, 3)).toEqual([0, 1, -1]);
  });

  it('custom cuts the price ladder with the curve', () => {
    const plan = pondPlanOf(CUSTOM, 'seed');
    expect(plan.throws.map((entry) => entry.price)).toEqual([100, 150, 200, 250, 300]);
    expect(plan.locations).toHaveLength(3);
    expect(plan.worstPriceOfPrize).toEqual([100, 150, 200]);
  });

  it('custom with zero items is not a check source', () => {
    const plan = pondPlanOf({ ...CUSTOM, items: 0 } as PondSetting, 'seed');
    expect(plan.locations).toEqual([]);
    expect(plan.throws.every((entry) => entry.prize === -1)).toBe(true);
  });

  it('gamble draws its winners once per seed and never pays back more than it took', () => {
    const plan = pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-a');
    expect(plan.throws).toHaveLength(POND_GAMBLE_CHANCES);
    expect(plan.throws.map((entry) => entry.price)).toEqual(
      Array.from({ length: POND_GAMBLE_CHANCES }, (_, index) => gamblePriceOf(index)));
    const winners = plan.throws.flatMap((entry, index) => (entry.prize >= 0 ? [index] : []));
    expect(winners).toHaveLength(3);
    expect([...winners].sort((a, b) => a - b)).toEqual(winners);
    for (const entry of plan.throws) expect(entry.refund).toBeLessThan(entry.price);
    // Same seed, same schedule; a different seed moves it.
    expect(pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-a')).toEqual(plan);
    const other = pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-b');
    expect(other.throws.map((entry) => entry.prize)).not.toEqual(plan.throws.map((entry) => entry.prize));
  });

  it('the wallet reading of a prize is the worst case, never the odds', () => {
    const plan = pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-a');
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

  it('allocates one line per distinct price and per distinct refund, plus the closing line', () => {
    // Vanilla cost charges the same hundred fourteen times and never pays back.
    const flat = pondLinesOf(pondPlanOf({ mode: 'vanilla-cost', items: 2 }, 'seed'));
    expect(flat.prices).toEqual([100]);
    expect(flat.refunds).toEqual([]);
    expect(flat.lines).toHaveLength(2);
    expect(flat.lines[flat.lines.length - 1]).toBe(POND_CLOSED_LINE);

    const custom = pondLinesOf(pondPlanOf(CUSTOM, 'seed'));
    expect(custom.prices).toEqual([100, 150, 200, 250, 300]);
    expect(custom.lines).toHaveLength(6);
  });

  it('quotes the amounts of the throws it was built from', () => {
    const plan = pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-a');
    const { prices, refunds, lines } = pondLinesOf(plan);
    expect(prices).toEqual(plan.throws.map((entry) => entry.price));
    // Every losing throw's refund has a line, and every line names its own number.
    for (const entry of plan.throws) {
      if (entry.refund > 0) expect(refunds).toContain(entry.refund);
    }
    prices.forEach((price, index) => {
      for (const candidate of receiptLineCandidates(lines[index])) {
        expect(candidate, `price ${price}`).toContain(String(price));
      }
    });
    refunds.forEach((refund, offset) => {
      for (const candidate of receiptLineCandidates(lines[prices.length + offset])) {
        expect(candidate, `refund ${refund}`).toContain(String(refund));
      }
    });
  });

  it('a free throw does not quote a price of zero', () => {
    const free = pondLinesOf(pondPlanOf(
      { mode: 'custom', start: 0, max: 0, throws: 1, items: 1, shape: { curve: 'equal' } }, 'seed'));
    for (const candidate of receiptLineCandidates(free.lines[0])) {
      expect(candidate).not.toContain('0 rupees');
      expect(candidate.toLowerCase()).toMatch(/free|house/);
    }
  });

  it('keeps a shortest candidate the text box can always show', () => {
    // The composer keeps the fullest candidate that fits three rows and falls back down
    // the list, so the LAST one has to fit at every amount the ladder can reach.
    const plan = pondPlanOf({ mode: 'gamble', items: 3 }, 'seed-a');
    const lines = [...pondLinesOf(plan).lines, POND_CLOSED_LINE];
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
    delete (values as Record<string, unknown>)['pond_mode'];
    expect(parsePondSetting(values).setting).toEqual(LEGACY_POND_SETTING);
  });

  it('the shipped baseline is the fresh-profile pond', () => {
    expect(parsePondSetting(apBaselineValues).setting).toEqual(DEFAULT_POND_SETTING);
  });

  it('round-trips every mode', () => {
    for (const setting of [LEGACY_POND_SETTING, { mode: 'vanilla-cost', items: 5 }, CUSTOM,
      { mode: 'gamble', items: 2 }] as PondSetting[]) {
      expect(parsePondSetting(pondValuesOf(setting)).setting).toEqual(setting);
    }
  });

  it('reports every fallback it applies', () => {
    const parsed = parsePondSetting({ ...pondValuesOf(CUSTOM), pond_start: 300, pond_max: 100 });
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
    expect(parsed.notes).toContain('pond: the wallet tops out at 599, so the price range is held at 500');
    const start = parsePondSetting({ ...pondValuesOf({ ...CUSTOM, start: 900, max: 999 }), ...walletTo('599') });
    expect(start.setting).toMatchObject({ mode: 'custom', start: 500, max: 500 });
  });

  it('leaves a fixed schedule alone: the wallet floor puts every top above it', () => {
    // Both fixed schedules top out at 240, and no reachable wallet sits below
    // 599 (capacity/wallet-floor.ts), so neither can ever be held.
    const gamble = parsePondSetting({ ...pondValuesOf({ mode: 'gamble', items: 3 }), ...walletTo('599') });
    expect(gamble.setting).toEqual({ mode: 'gamble', items: 3 });
    expect(gamble.notes).toEqual([]);
    const plan = pondPlanOf(gamble.setting, 'seed-a');
    expect(plan.throws.map((entry) => entry.price)).toEqual([20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240]);
    for (const entry of plan.throws) expect(entry.refund).toBeLessThan(Math.max(1, entry.price));
    const vanilla = parsePondSetting({ ...pondValuesOf({ mode: 'vanilla-cost', items: 2 }), ...walletTo('599') });
    expect(vanilla.setting).toEqual({ mode: 'vanilla-cost', items: 2 });
    expect(pondPlanOf(vanilla.setting, 'seed').totalPrice).toBe(1400);
  });

  it('leaves every setting untouched under a wallet that reaches its prices', () => {
    for (const setting of [{ mode: 'vanilla-cost', items: 5 }, { ...CUSTOM, max: 999 },
      { mode: 'gamble', items: 2 }] as PondSetting[]) {
      expect(parsePondSetting({ ...pondValuesOf(setting), ...walletTo('999') }).setting).toEqual(setting);
    }
    // The two fixed schedules top out at 240 and 100: a 299 wallet reaches both, so no ceiling is written.
    for (const setting of [{ mode: 'vanilla-cost', items: 5 }, { mode: 'gamble', items: 2 }] as PondSetting[]) {
      expect(parsePondSetting({ ...pondValuesOf(setting), ...walletTo('299') }).setting).toEqual(setting);
    }
  });
});
