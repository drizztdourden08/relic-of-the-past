/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { DEFAULT_ITEM_POWER, derivedItemPower, TICK_CONSEQUENCES, progressiveTickConsequences, defaultProgressiveSetting, beamSwordReachable, swordReachable } from '@rotp/randomizer';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { ProgressiveSetting } from '@rotp/randomizer';

const withSwordTicks = (ticks: readonly boolean[]): ProgressiveSetting => ({
  ...defaultProgressiveSetting(), sword: ticks,
});

const termsOf = (setting: ProgressiveSetting): readonly string[] =>
  progressiveTickConsequences(setting).map(({ term }) => term.key);

const maskedFieldsOf = (setting: ProgressiveSetting): readonly string[] => {
  const derived = derivedItemPower(
    DEFAULT_ITEM_POWER, swordReachable(setting), beamSwordReachable(setting));
  return (Object.keys(DEFAULT_ITEM_POWER) as Array<keyof ItemPowerSetting>)
    .filter((field) => derived[field] !== DEFAULT_ITEM_POWER[field]);
};

const shownFieldsOf = (setting: ProgressiveSetting): readonly string[] => {
  const shown = new Set(termsOf(setting));
  return TICK_CONSEQUENCES.filter(({ line }) => shown.has(line.term.key)).map(({ field }) => field);
};

const NO_BLADE = withSwordTicks([false, false, false, false]);
const FIRST_RUNG_ONLY = withSwordTicks([true, false, false, false]);
const BEAM_ONLY = withSwordTicks([false, true, false, false]);

describe('progressive tick consequences', { tags: ['critical'] }, () => {
  it('says nothing while every rung is ticked', () => {
    expect(progressiveTickConsequences(defaultProgressiveSetting())).toEqual([]);
  });

  it('says nothing while a beam rung is ticked, even with the first rung off', () => {
    expect(progressiveTickConsequences(BEAM_ONLY)).toEqual([]);
  });

  it('names all five rules when no blade is in the pool', () => {
    expect(termsOf(NO_BLADE)).toEqual([
      'randomizer:tick.pullable-curtains.term', 'randomizer:tick.swordless-medallions.term', 'randomizer:tick.hammer-tablets.term',
      'randomizer:tick.hammer-tower-seal.term', 'randomizer:tick.hammer-last-fight.term',
    ]);
  });

  it('names only the beam three when the first rung alone is ticked', () => {
    expect(termsOf(FIRST_RUNG_ONLY)).toEqual([
      'randomizer:tick.hammer-tablets.term', 'randomizer:tick.hammer-tower-seal.term', 'randomizer:tick.hammer-last-fight.term',
    ]);
  });

  it('stays in lockstep with the item-power derivation', () => {
    for (const setting of [defaultProgressiveSetting(), BEAM_ONLY, FIRST_RUNG_ONLY, NO_BLADE]) {
      expect([...shownFieldsOf(setting)].sort()).toEqual([...maskedFieldsOf(setting)].sort());
    }
  });
});
