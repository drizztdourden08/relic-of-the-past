/* @layer shared-game @kind logic */
import type { SlotKey } from '../location-key.type';

const isSlotKey = (key: string): key is SlotKey => key.startsWith('slot-');

export { isSlotKey };
