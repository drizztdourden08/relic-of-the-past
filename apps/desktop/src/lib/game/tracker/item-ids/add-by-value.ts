/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { addNative } from './add-native';

const addByValue = (out: Set<ItemId>, table: Readonly<Record<number, number>>, value: number): void => {
  const receiveItemId = table[value];
  if (receiveItemId !== undefined) addNative(out, receiveItemId);
};

export { addByValue };
