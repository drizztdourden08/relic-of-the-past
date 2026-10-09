/* @layer shared-game @kind logic */
import { walletCapacity } from '../../state-helpers-capacity';
import { retroShotWalletNeed } from '../retro-shot-wallet-need';
import type { CollectionState } from '../../collection-state';
import type { RetroBowSetting } from '../retro.type';

const canAffordShots = (state: CollectionState, setting: RetroBowSetting): boolean =>
  walletCapacity(state) >= retroShotWalletNeed(setting);

export { canAffordShots };
