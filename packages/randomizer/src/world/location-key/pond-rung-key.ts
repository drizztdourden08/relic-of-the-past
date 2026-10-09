/* @layer shared-game @kind logic */
import type { SlotKey } from '../location-key.type';

const pondRungKey = (pondId: string, rung: number): SlotKey => `slot-pond-${pondId}-${rung}`;

export { pondRungKey };
