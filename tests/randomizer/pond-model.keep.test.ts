/* @layer tests @kind test */
/**
 * The pond model: the rupee decomposition, the modes' schedules, the snapshot
 * adapter (a snapshot with no pond row means the legacy pond, and so does a
 * mode the model no longer offers), the wallet reading of a prize, and the
 * pond's own receipt lines: the price of a toss, a prize award, an emptied
 * pond, which have to quote the plan's real amounts, because every vanilla
 * line they replace names an amount no plan charges or asks a question no
 * plan puts.
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
    expect(plan.locations).toEqual(['Capacity Upgrade Pond 1', 'Capacity Upgrade Pond 2']);
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
      { mode: 'custom', start: 0, max: 0, throws: 1, items: 1, shape: { curve: 'equal' } }, 'seed'));
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
    delete (values as Record<string, unknown>)['pond_mode'];
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
    const parsed = parsePondSetting({ ...pondValuesOf(CUSTOM), pond_mode: 'gamble' });
    expect(parsed.setting).toEqual(LEGACY_POND_SETTING);
    expect(parsed.notes).toContain('pond: unknown mode gamble, using the vanilla pond');
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
