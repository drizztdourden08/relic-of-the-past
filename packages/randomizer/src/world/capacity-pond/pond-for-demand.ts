/* @layer shared-game @kind logic */
import { pondSettingForMode } from '../pond/pond-mode-switch';
import { FORCED_POND_MODE } from './capacity-pond.constants';
import { isPondActive } from './is-pond-active';
import type { PondSetting } from '../pond/pond-profile.type';
import type { PondDemand } from './capacity-pond-rule.type';

const pondForDemand = (pond: PondSetting, demand: PondDemand): PondSetting => {
  if (demand === undefined) return pond;
  if (demand === 'active') return isPondActive(pond) ? pond : pondSettingForMode(FORCED_POND_MODE, pond);
  return pondSettingForMode('capacity', pond);
};

export { pondForDemand };
