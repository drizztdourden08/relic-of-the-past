/* @layer shared-game @kind logic */
import { parseCapacityProfile } from '../../capacity/capacity-profile-from-snapshot';
import { holdPondToWallet, pondWalletTopOf } from '../pond-wallet-top';
import { CAPACITY_POND } from '../pond-instances';
import { askedPondSetting } from './asked-pond-setting';
import type { PartialOptionValues } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';
import type { ParsedPondSetting } from '../pond.type';

const parsePondSetting = (values: PartialOptionValues, pond: PondInstance = CAPACITY_POND): ParsedPondSetting => {
  const asked = askedPondSetting(values, pond);
  if (asked.setting.mode === 'capacity') return asked;
  const held = holdPondToWallet(asked.setting, pondWalletTopOf(parseCapacityProfile(values).profile), pond);
  return { setting: held.setting, notes: [...asked.notes, ...held.notes] };
};

export { parsePondSetting };
