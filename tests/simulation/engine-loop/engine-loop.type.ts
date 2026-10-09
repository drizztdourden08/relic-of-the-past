/* @layer tests @kind type */
import type { SimChest } from '@rotp/navigation';

interface WorldChest extends SimChest {
  screenId: string;
}

export type { WorldChest };
