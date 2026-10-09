/* @layer shared-game @kind logic */
import { beamSwordReachable, swordReachable } from '../progressive-reach';
import { TICK_CONSEQUENCES } from './tick-consequences.constants';
import type { OptionDetail } from '../../option-description.type';
import type { BladeCondition, ProgressiveSetting } from '../progressive.type';

const conditionHolds = (when: BladeCondition, setting: ProgressiveSetting): boolean =>
  (when === 'noBlade' ? !swordReachable(setting) : !beamSwordReachable(setting));

const progressiveTickConsequences = (setting: ProgressiveSetting): readonly OptionDetail[] =>
  TICK_CONSEQUENCES.filter(({ when }) => conditionHolds(when, setting)).map(({ line }) => line);

export { progressiveTickConsequences };
