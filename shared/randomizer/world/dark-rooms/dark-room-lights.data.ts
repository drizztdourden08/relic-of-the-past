/* @layer shared-game @kind data */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type { DarkRoomLightField, DarkRoomSetting } from './dark-room.type';

const DARK_ROOM_LIGHT_FIELDS: readonly DarkRoomLightField[] = ['lamp', 'fireRod', 'bombos', 'redCane'];

const DARK_ROOM_LIGHT_ITEMS: Readonly<Record<DarkRoomLightField, ItemId>> = {
  lamp: ITEM.lamp,
  fireRod: ITEM.fireRod,
  bombos: ITEM.bombos,
  redCane: ITEM.caneOfSomaria,
};

const REFERENCE_DARK_ROOM_SETTING: DarkRoomSetting = {
  requireLight: true,
  lights: { lamp: true, fireRod: false, bombos: false, redCane: false },
};

const DEFAULT_DARK_ROOM_SETTING: DarkRoomSetting = {
  requireLight: true,
  lights: { lamp: true, fireRod: true, bombos: true, redCane: true },
};

export {
  DARK_ROOM_LIGHT_FIELDS,
  DARK_ROOM_LIGHT_ITEMS,
  DEFAULT_DARK_ROOM_SETTING,
  REFERENCE_DARK_ROOM_SETTING,
};
