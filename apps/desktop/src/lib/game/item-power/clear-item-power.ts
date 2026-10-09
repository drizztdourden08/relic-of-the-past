/* @layer bridge-wasm @kind logic */
import { itemPowerState } from './item-power-state';
import { writeItemPowerWord } from './write-item-power-word';

const clearItemPower = (): void => {
  itemPowerState.settingsWord = 0;
  itemPowerState.wishPondPlanArmed = false;
  writeItemPowerWord(0);
};

export { clearItemPower };
