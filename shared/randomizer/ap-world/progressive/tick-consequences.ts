/* @layer shared-game @kind logic */
/**
 * What a tick set changes about the WORLD, said one line at a time.
 *
 * Unticking rungs of the blade family does more than shorten a ladder: five
 * rules that ask for a blade have no answer left, so each one relaxes onto
 * something the seed can still hand over. Those relaxations are decided in
 * exactly one place (item-power/item-power-rule.ts, `derivedItemPower`), which
 * masks the matching switch on whenever the requirement could never be met.
 * This file is the reading of that same pair of conditions in words, so a
 * panel can say what the ticks have just done instead of printing a fixed
 * paragraph that is wrong for most tick sets.
 *
 * The two conditions are the ones `derivedItemPower` hangs off:
 *  - no blade at all can be found, the reference's swordless setting, arrived
 *    at from the ticks;
 *  - no blade that throws a beam can be found, which the first rung alone also
 *    fails, because it scores nothing against the seal or the last fight.
 *
 * A line is a CONSEQUENCE, not advice: it appears only while its condition
 * holds, so the default tick set (every rung on) produces none at all. The
 * `field` on each row is the switch it stands in lockstep with, so a change to
 * the derivation is caught against this table instead of drifting from it.
 */
import { beamSwordReachable, swordReachable } from './progressive-reach';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { OptionDetail } from '../option-description.type';
import type { ProgressiveSetting } from './progressive.type';

/** Which reading of the blade ladder a consequence hangs off. */
type BladeCondition = 'noBlade' | 'noBeam';

interface TickConsequence {
  /** The item-power switch this line stands for. */
  field: keyof ItemPowerSetting;
  when: BladeCondition;
  line: OptionDetail;
}

/** In the order a run meets them. */
const TICK_CONSEQUENCES: readonly TickConsequence[] = [
  {
    field: 'pullableCurtains',
    when: 'noBlade',
    line: {
      term: 'Hanging cloth doors',
      detail: 'nothing can cut one down, so it comes down by facing it, taking hold with A and pulling away.',
    },
  },
  {
    field: 'swordlessMedallions',
    when: 'noBlade',
    line: {
      term: 'Medallion doors',
      detail: 'no blade is in the pool at all, so the medallion alone opens each of the two.',
    },
  },
  {
    field: 'hammerTablets',
    when: 'noBeam',
    line: {
      term: 'Tablets',
      detail: 'no blade in the pool throws a beam, so they wake for the hammer instead.',
    },
  },
  {
    field: 'hammerTowerSeal',
    when: 'noBeam',
    line: {
      term: 'The tower seal',
      detail: 'it throws back anything less than a beam, so with none in the seed a hammer breaks it.',
    },
  },
  {
    field: 'hammerLastFight',
    when: 'noBeam',
    line: {
      term: 'The last fight',
      detail: 'no beam can reach it, so the hammer lands where it is otherwise refused outright.',
    },
  },
];

const conditionHolds = (when: BladeCondition, setting: ProgressiveSetting): boolean =>
  (when === 'noBlade' ? !swordReachable(setting) : !beamSwordReachable(setting));

/** One line per rule this tick set has moved; empty while every rung is ticked. */
const progressiveTickConsequences = (setting: ProgressiveSetting): readonly OptionDetail[] =>
  TICK_CONSEQUENCES.filter(({ when }) => conditionHolds(when, setting)).map(({ line }) => line);

export { TICK_CONSEQUENCES, progressiveTickConsequences };
export type { TickConsequence };
