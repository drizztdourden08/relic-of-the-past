/* @layer shared-game @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ItemId } from '../ids';

interface InventorySlot {
  displayName: Message;
  trackerItemIds: ItemId[];
  sprite: string;
}

interface InventoryCategory {
  label: Message;
  items: InventorySlot[];
}

type InventoryViewMode = 'default' | 'ingame' | 'compact';

export type { InventoryCategory, InventorySlot, InventoryViewMode };
