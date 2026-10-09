/* @layer bridge-wasm @kind logic */
import { itemPowerState } from './item-power-state';
import { pushItemPowerWord } from './push-item-power-word';

const setWishPondPlanActive = (on: boolean): void => {
  if (itemPowerState.wishPondPlanArmed === on) return;
  itemPowerState.wishPondPlanArmed = on;
  pushItemPowerWord();
};

export { setWishPondPlanActive };
