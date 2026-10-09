/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { darkRoomLightWordOf } from '@rotp/game-core';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { ItemPowerSetting } from '@rotp/game-core';
import { itemPowerState } from '@rotp/game-core';
import { itemPowerWordOf } from '@rotp/game-core';
import { pushItemPowerWord } from './push-item-power-word';

const setItemPower = (setting: ItemPowerSetting, darkRooms: DarkRoomSetting): void => {
  itemPowerState.settingsWord = itemPowerWordOf(setting) | darkRoomLightWordOf(darkRooms);
  pushItemPowerWord();
  log.randomizer(`[Randomizer] Item power armed: 0x${itemPowerState.settingsWord.toString(16)}`);
};

export { setItemPower };
