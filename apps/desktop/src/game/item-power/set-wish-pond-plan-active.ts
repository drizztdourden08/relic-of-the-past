/* @layer bridge-wasm @kind logic */
import { itemPowerState } from '@rotp/game-core';
import { pushItemPowerWord } from './push-item-power-word';

const setWishPondPlanActive = (on: boolean): void => {
  if (itemPowerState.wishPondPlanArmed === on) return;
  itemPowerState.wishPondPlanArmed = on;
  pushItemPowerWord();
};

export { setWishPondPlanActive };
