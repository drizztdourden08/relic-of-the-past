/* @layer tests @kind types */
import type { ItemId } from '@rotp/game-data';

interface TrackerStep {
  name: string;
  completedEvery: number;
  completedLimit: number;
  fired: number;
  items: readonly ItemId[];
  events: 'none' | 'half' | 'all';
  darkRoomsNeedLight: boolean;
  bigKeyDoors: boolean;
  smallKeyDoors: boolean;
}

export type { TrackerStep };
