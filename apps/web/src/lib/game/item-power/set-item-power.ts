/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { darkRoomLightWordOf } from '../dark-room-lights';
import type { DarkRoomSetting } from '@shared/randomizer/world/dark-rooms/dark-room.type';
import type { ItemPowerSetting } from '@shared/randomizer/world/item-power/item-power.type';
import { itemPowerState } from './item-power-state';
import { itemPowerWordOf } from './item-power-word-of';
import { pushItemPowerWord } from './push-item-power-word';

const setItemPower = (setting: ItemPowerSetting, darkRooms: DarkRoomSetting): void => {
  itemPowerState.settingsWord = itemPowerWordOf(setting) | darkRoomLightWordOf(darkRooms);
  pushItemPowerWord();
  log.randomizer(`[Randomizer] Item power armed: 0x${itemPowerState.settingsWord.toString(16)}`);
};

export { setItemPower };
