/* @layer shared-game @kind logic */
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.data';
import type { RetroBowSetting } from './retro.type';

const retroShotWalletNeed = (setting: RetroBowSetting): number => Math.max(
  setting.woodArrowCost,
  FINAL_FIGHT_SILVER_HITS * setting.silverArrowCost,
);

export { retroShotWalletNeed };
