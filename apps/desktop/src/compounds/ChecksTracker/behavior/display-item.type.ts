/* @layer renderer-components @kind types */
import type { ItemId } from '@rotp/game-data';

interface DisplayItem {
  shownId: ItemId | undefined;
  name: string | undefined;
}

export type { DisplayItem };
