/* @layer shared-game @kind logic */
import type { SimChest } from '../../types';

const chestKey = (chest: SimChest): string => `chest:${chest.roomId}:${chest.chestIndex}`;

export { chestKey };
