/* @layer shared-game @kind logic */
import { WALLET } from '../capacity/capacity-family';
import { familySettingOf } from './family-setting-of';
import { tierReached } from './tier-reached';
import type { CollectionState } from '../collection-state.type';

const walletCapacity = (state: CollectionState): number => {
  const setting = familySettingOf(state, WALLET);
  const { ladder, vanillaRung } = WALLET;
  if (setting.mode !== 'custom') return ladder[vanillaRung];
  return ladder[tierReached(state, WALLET, setting)];
};

export { walletCapacity };
