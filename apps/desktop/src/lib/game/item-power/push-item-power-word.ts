/* @layer bridge-wasm @kind logic */
import { ITEM_POWER_BIT } from './item-power.constants';
import { itemPowerState } from './item-power-state';
import { writeItemPowerWord } from './write-item-power-word';

const pushItemPowerWord = (): void => {
  const { settingsWord, wishPondPlanArmed } = itemPowerState;
  writeItemPowerWord(settingsWord | (wishPondPlanArmed ? ITEM_POWER_BIT.wishPondPlan : 0));
};

export { pushItemPowerWord };
