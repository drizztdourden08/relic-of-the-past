/* @layer tests @kind helper */
import type { SimObservation, TriggerAction, FlagSnapshot } from '../../../shared/game/simulation/types';
import type { EngineState } from '../../../shared/game/simulation/engine/state';
import { emptySnapshot, cloneSnapshot } from '../../../shared/game/simulation/detect/flag-snapshot';
import { getItemByGameId } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import { CHEST_OPEN_MASKS } from './engine-loop.constants';
import type { WorldChest } from './engine-loop.type';

class FakeWorld {
  flags: FlagSnapshot = emptySnapshot();
  inventory = new Set<ItemId>();
  pendingItem: ItemId | undefined;
  virtualScreen = 'A';

  constructor(private chests: WorldChest[]) {}

  private chestOpened(c: WorldChest): boolean {
    return (this.flags.dungInfo[c.roomId] & CHEST_OPEN_MASKS[c.chestIndex]) !== 0;
  }

  observe(state: EngineState): SimObservation {
    this.virtualScreen = state.virtual.screenId;
    const item = this.pendingItem;
    this.pendingItem = undefined;
    const chests = this.chests
      .filter(c => c.screenId === this.virtualScreen)
      .map(c => ({ ...c, opened: this.chestOpened(c) }));
    return {
      virtual: { screenId: this.virtualScreen, tile: { row: 0, col: 0 } },
      realLocation: { isIndoors: true, roomId: 0, owScreenIndex: 0 },
      inventory: new Set(this.inventory),
      flags: cloneSnapshot(this.flags),
      interactables: { chests, sprites: [], doors: [] },
      itemReceived: item,
    };
  }

  apply(action: TriggerAction): void {
    if (action.type !== 'chest') return;
    this.flags.dungInfo[action.roomId] |= CHEST_OPEN_MASKS[action.chestIndex];
    const item = getItemByGameId({ receiveItemId: action.itemId });
    this.pendingItem = item?.id;
    if (item) this.inventory.add(item.id);
  }
}

export { FakeWorld };
