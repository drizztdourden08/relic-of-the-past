/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { holdCustom } from './hold-custom';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';
import type { HeldPondSetting } from '../pond.type';

const holdPondToWallet = (
  setting: PondSetting, walletTop: number, pond: PondInstance = CAPACITY_POND,
): HeldPondSetting => {
  if (setting.mode === 'custom') return holdCustom(setting, walletTop, pond);
  return { setting, notes: [] };
};

export { holdPondToWallet };
