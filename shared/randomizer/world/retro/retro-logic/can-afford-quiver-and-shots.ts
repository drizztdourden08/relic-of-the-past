/* @layer shared-game @kind logic */
import { walletCapacity } from '../../state-helpers-capacity';
import { retroWalletNeed } from '../retro-wallet-need';
import type { CollectionState } from '../../collection-state';
import type { RetroBowSetting } from '../retro.type';

const canAffordQuiverAndShots = (state: CollectionState, setting: RetroBowSetting): boolean =>
  walletCapacity(state) >= retroWalletNeed(setting);

export { canAffordQuiverAndShots };
