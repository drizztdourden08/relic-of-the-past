/* @layer tests @kind test */
/**
 * Which consequence lines a tick set produces, and that the table they come
 * from has not drifted from the derivation it describes.
 *
 * The lines are the panel's live reading of `derivedItemPower`, so the load-
 * bearing assertion here is the lockstep one: for any tick set, the switches
 * the derivation masks on are exactly the switches the visible lines stand
 * for. Everything else is the plain contract: nothing while the ladder is
 * whole, the beam-only three while the first rung alone is ticked.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { derivedItemPower } from '@shared/randomizer/ap-world/item-power/item-power-rule';
import {
  TICK_CONSEQUENCES, progressiveTickConsequences,
} from '@shared/randomizer/ap-world/progressive/tick-consequences';
import { defaultProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/ap-world/progressive/progressive-reach';
import type { ItemPowerSetting } from '@shared/randomizer/ap-world/item-power/item-power.type';
import type { ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';

/** The default set with the blade family's ticks replaced. */
const withSwordTicks = (ticks: readonly boolean[]): ProgressiveSetting => ({
  ...defaultProgressiveSetting(), sword: ticks,
});

const termsOf = (setting: ProgressiveSetting): readonly string[] =>
  progressiveTickConsequences(setting).map(({ term }) => term);

/** The switches the derivation masks on for this tick set. */
const maskedFieldsOf = (setting: ProgressiveSetting): readonly string[] => {
  const derived = derivedItemPower(
    DEFAULT_ITEM_POWER, swordReachable(setting), beamSwordReachable(setting));
  return (Object.keys(DEFAULT_ITEM_POWER) as Array<keyof ItemPowerSetting>)
    .filter((field) => derived[field] !== DEFAULT_ITEM_POWER[field]);
};

/** The switches the visible lines stand for, in table order. */
const shownFieldsOf = (setting: ProgressiveSetting): readonly string[] => {
  const shown = new Set(termsOf(setting));
  return TICK_CONSEQUENCES.filter(({ line }) => shown.has(line.term)).map(({ field }) => field);
};

const NO_BLADE = withSwordTicks([false, false, false, false]);
const FIRST_RUNG_ONLY = withSwordTicks([true, false, false, false]);
const BEAM_ONLY = withSwordTicks([false, true, false, false]);

describe('progressive tick consequences', () => {
  it('says nothing while every rung is ticked', () => {
    expect(progressiveTickConsequences(defaultProgressiveSetting())).toEqual([]);
  });

  it('says nothing while a beam rung is ticked, even with the first rung off', () => {
    expect(progressiveTickConsequences(BEAM_ONLY)).toEqual([]);
  });

  it('names all five rules when no blade is in the pool', () => {
    expect(termsOf(NO_BLADE)).toEqual([
      'Hanging cloth doors', 'Medallion doors', 'Tablets', 'The tower seal', 'The last fight',
    ]);
  });

  it('names only the beam three when the first rung alone is ticked', () => {
    expect(termsOf(FIRST_RUNG_ONLY)).toEqual(['Tablets', 'The tower seal', 'The last fight']);
  });

  it('gives every line a term and a finished sentence', () => {
    for (const { term, detail } of progressiveTickConsequences(NO_BLADE)) {
      expect(term.length).toBeGreaterThan(0);
      expect(detail.endsWith('.')).toBe(true);
      expect(detail.startsWith(term)).toBe(false);
    }
  });

  it('stays in lockstep with the item-power derivation', () => {
    for (const setting of [defaultProgressiveSetting(), BEAM_ONLY, FIRST_RUNG_ONLY, NO_BLADE]) {
      expect([...shownFieldsOf(setting)].sort()).toEqual([...maskedFieldsOf(setting)].sort());
    }
  });
});
