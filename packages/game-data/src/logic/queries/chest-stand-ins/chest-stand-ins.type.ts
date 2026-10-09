/* @layer shared-game @kind types */
import type { ItemId } from '../../../data';

interface ChestSwap {
  primary: ItemId;
  standIn: ItemId;
}

export type { ChestSwap };
