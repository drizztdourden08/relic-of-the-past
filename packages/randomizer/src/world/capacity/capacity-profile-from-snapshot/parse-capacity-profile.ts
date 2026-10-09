/* @layer shared-game @kind logic */
import { RETRO_BOW_KEY } from '../../retro/retro-bow.data';
import { FAMILIES, familyById } from '../capacity-family';
import { capacityKeyOf } from '../capacity-option-keys';
import { REFERENCE_CAPACITY_PROFILE } from '../capacity-profile-defaults';
import { walletFloorOf } from '../wallet-floor';
import { withRetroBow } from '../retro-projectiles';
import { familySettingOf } from './family-setting-of';
import type { CapacityProfile, ParsedCapacityProfile, WalletSetting } from '../capacity-profile.type';
import type { PartialOptionValues } from '../../options.type';

const hasCapacityRows = (values: PartialOptionValues): boolean =>
  FAMILIES.some((capacityFamily) => values[capacityKeyOf(capacityFamily.id, 'mode')] !== undefined);

const parseCapacityProfile = (values: PartialOptionValues): ParsedCapacityProfile => {
  const retroBow = values[RETRO_BOW_KEY] === true;
  if (!hasCapacityRows(values)) {
    return { profile: withRetroBow(REFERENCE_CAPACITY_PROFILE, retroBow), notes: [] };
  }
  const notes: string[] = [];
  const walletFloor = walletFloorOf(values);
  const profile: CapacityProfile = {
    explosives: familySettingOf(familyById('explosives'), values, notes, walletFloor),
    projectiles: familySettingOf(familyById('projectiles'), values, notes, walletFloor),
    meter: familySettingOf(familyById('meter'), values, notes, walletFloor),
    wallet: familySettingOf(familyById('wallet'), values, notes, walletFloor) as WalletSetting,
  };
  return { profile: withRetroBow(profile, retroBow), notes };
};

export { parseCapacityProfile };
