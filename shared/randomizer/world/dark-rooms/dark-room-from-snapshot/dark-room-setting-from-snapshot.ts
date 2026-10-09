/* @layer shared-game @kind logic */
import { darkRoomSettingOfValues } from './dark-room-setting-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { DarkRoomSetting } from '../dark-room.type';

const darkRoomSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): DarkRoomSetting =>
  darkRoomSettingOfValues(snapshot.values);

export { darkRoomSettingFromSnapshot };
