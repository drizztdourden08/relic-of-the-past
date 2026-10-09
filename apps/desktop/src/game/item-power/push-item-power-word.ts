/* @layer bridge-wasm @kind logic */
import { ITEM_POWER_BIT, itemPowerState } from '@rotp/game-core';
import { writeItemPowerWord } from './write-item-power-word';

const pushItemPowerWord = (): void => {
  const { settingsWord, wishPondPlanArmed } = itemPowerState;
  writeItemPowerWord(settingsWord | (wishPondPlanArmed ? ITEM_POWER_BIT.wishPondPlan : 0));
};

export { pushItemPowerWord };
