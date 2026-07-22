/* @layer bridge-wasm @kind logic */
/**
 * Maps a TriggerAction onto the delivery queue and resolves once the queued
 * delivery has FULLY completed (the queue's per-entry onComplete callback fires
 * when the game consumed the item and is ready again, not merely when the flag
 * was written). This paces the runner off real pickup completion so it doesn't
 * step the engine while the item is still incoming / the item-get dialog animates.
 */
import type { TriggerAction } from '@shared/game/simulation';
import { ITEM_ID_TO_NAME } from '@shared/game/items';
import { enqueue } from '../delivery-queue';
import { wasmTriggerOverworldCheck } from '../';

const SOURCE = 'simulator';

const labelFor = (itemId: number): string => ITEM_ID_TO_NAME[itemId] ?? `item 0x${itemId.toString(16)}`;

const trigger = (action: TriggerAction): Promise<void> =>
  new Promise((resolve) => {
    switch (action.type) {
      case 'chest':
        enqueue(labelFor(action.itemId), SOURCE,
          { type: 'trigger_check', roomId: action.roomId, chestIndex: action.chestIndex, itemId: action.itemId },
          resolve);
        return;
      case 'npc':
        // The engine's npc action carries only the flag payload; sprite 0xFF means
        // no in-game sprite transition and no id-specific side effects — pure flag + item.
        enqueue(labelFor(action.itemId), SOURCE,
          { type: 'trigger_npc_check', flagType: action.flagType, flagMask: action.flagMask, itemId: action.itemId, spriteType: 0xff, postGfx: 0 },
          resolve);
        return;
      case 'overworld':
        enqueue(labelFor(action.itemId), SOURCE,
          { type: 'custom', execute: () => wasmTriggerOverworldCheck(action.screen, action.mask, action.itemId) },
          resolve);
        return;
      case 'boss':
        // Simplified: set the boss room flag + grant its item, then queue the prize
        // as a second delivery. Resolve on whichever entry executes last.
        enqueue(`boss room 0x${action.roomId.toString(16)}`, SOURCE,
          { type: 'trigger_check', roomId: action.roomId, chestIndex: 0, itemId: action.itemId },
          action.prizeId ? undefined : resolve);
        if (action.prizeId) {
          enqueue(labelFor(action.prizeId), SOURCE, { type: 'give_item', itemId: action.prizeId }, resolve);
        }
        return;
    }
  });

export { trigger };
