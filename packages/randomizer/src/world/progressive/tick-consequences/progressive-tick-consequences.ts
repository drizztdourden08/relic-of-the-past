/* @layer shared-game @kind logic */
import { beamSwordReachable, swordReachable } from '../progressive-reach';
import { TICK_CONSEQUENCES } from './tick-consequences.constants';
import type { BladeCondition, ProgressiveSetting, TickConsequenceLine } from '../progressive.type';

const conditionHolds = (when: BladeCondition, setting: ProgressiveSetting): boolean =>
  (when === 'noBlade' ? !swordReachable(setting) : !beamSwordReachable(setting));

const progressiveTickConsequences = (setting: ProgressiveSetting): readonly TickConsequenceLine[] =>
  TICK_CONSEQUENCES.filter(({ when }) => conditionHolds(when, setting)).map(({ line }) => line);

export { progressiveTickConsequences };
