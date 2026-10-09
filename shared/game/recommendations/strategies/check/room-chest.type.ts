/* @layer shared-game @kind types */
import type { ChestObservation } from '../../detection-types';

interface RoomChest { roomId: number; chest: ChestObservation }

export type { RoomChest };
