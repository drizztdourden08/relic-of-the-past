/* @layer renderer-widgets @kind logic */
import { CheatSlot } from '@app/game';

const isSlotOwned = (slot: number, value: number): boolean => value > 0 || slot === CheatSlot.Armor;

export { isSlotOwned };
