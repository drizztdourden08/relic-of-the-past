/* @layer shared-game @kind logic */
import { VANILLA_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { withRetroBow } from '../capacity/retro-projectiles';
import { pondSettingForMode } from '../pond/pond-mode-switch';
import { capacityPondNotesOf } from './capacity-pond-notes-of';
import { forcedFamiliesOf } from './forced-families-of';
import { pondModesOf } from './pond-modes-of';
import { settleCapacityPond } from './settle-capacity-pond';
import type {
  CapacityPondAuthority, CapacityPondSelection, ReconciledCapacityPond,
} from './capacity-pond-rule.type';

const reconcileCapacityPond = (
  selection: CapacityPondSelection, authority: CapacityPondAuthority = 'pond',
): ReconciledCapacityPond => {
  const { retroBow } = selection;
  const settled = selection.enabled
    ? settleCapacityPond({ ...selection, capacity: withRetroBow(selection.capacity, retroBow) }, authority)
    : { enabled: false, capacity: VANILLA_CAPACITY_PROFILE, pond: pondSettingForMode('capacity', selection.pond), retroBow };
  return {
    ...settled,
    notes: capacityPondNotesOf(settled),
    capacityEditable: settled.enabled,
    pondEditable: settled.enabled,
    pondModes: pondModesOf(settled),
    forcedFamilies: forcedFamiliesOf(settled),
  };
};

export { reconcileCapacityPond };
