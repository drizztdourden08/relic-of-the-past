/* @layer tests @kind type */
import type { SimChest } from '../../../shared/game/simulation/types';

interface WorldChest extends SimChest {
  screenId: string;
}

export type { WorldChest };
