/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { pondPlanOf } from '../pond-plan';
import { isPondDeliverable } from './is-pond-deliverable';
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const sellsALadder = (setting: PondSetting, pond: PondInstance): boolean =>
  (pond.id === CAPACITY_POND.id ? setting.mode !== 'capacity' : setting.mode === 'custom');

const presentRungsOf = (
  setting: PondSetting, pond: PondInstance, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] => {
  if (!sellsALadder(setting, pond) || !isPondDeliverable(deliverable, pond)) return [];
  return [...pondPlanOf(setting, pond).locations];
};

export { presentRungsOf };
