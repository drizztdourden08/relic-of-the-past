/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import {
  POND_AWARD_LAST_LINE, POND_AWARD_MORE_LINE, POND_CLOSED_LINE, pondLinesOf,
} from '@shared/randomizer/receipt-text/pond-lines';
import { receiptLineCandidates } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import { CUSTOM, LONGEST_FITTING_LINE } from './pond-model.constants';

describe('pond receipt lines', () => {
  it('allocates one line per distinct price, then the award and closing lines', () => {
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
    const plan = pondPlanOf({ ...CUSTOM, start: 0, max: 999, throws: 19 } as PondSetting);
    const lines = [...pondLinesOf(plan).lines, POND_AWARD_MORE_LINE, POND_AWARD_LAST_LINE, POND_CLOSED_LINE];
    for (const line of lines) {
      const candidates = receiptLineCandidates(line);
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[candidates.length - 1].length).toBeLessThanOrEqual(LONGEST_FITTING_LINE);
    }
  });
});
