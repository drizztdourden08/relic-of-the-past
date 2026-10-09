/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { parsePondSetting } from './parse-pond-setting';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const pondSettingFromSnapshot = (
  snapshot: RandomizerOptionsSnapshot, pond: PondInstance = CAPACITY_POND,
): PondSetting => parsePondSetting(snapshot.values, pond).setting;

export { pondSettingFromSnapshot };
