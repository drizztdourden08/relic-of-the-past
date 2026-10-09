/* @layer shared-game @kind logic */
import { RETRO_QUIVER_PRICE } from './retro-bow.constants';
import { retroShotWalletNeed } from './retro-shot-wallet-need';
import type { RetroBowSetting } from './retro.type';

const retroWalletNeed = (setting: RetroBowSetting): number =>
  Math.max(RETRO_QUIVER_PRICE, retroShotWalletNeed(setting));

export { retroWalletNeed };
