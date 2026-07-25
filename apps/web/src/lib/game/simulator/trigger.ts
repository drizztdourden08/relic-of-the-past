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
import { wasmTriggerOverworldCheck, wasmGetRoomDoorInfo, wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop,
  wasmSimZeldaFollow, wasmSimZeldaRescue, wasmSimOpenCellLock } from '../';
import { getCurrentInventory } from '../tracker';
import { outerWall, OPPOSITE, ROOM_EDGE_ADJ } from './room-doorways';

const SOURCE = 'simulator';

/**
 * The records describing one PHYSICAL doorway: the room's own [roomId, index]
 * plus, for an outer-wall door, the adjacent room's matching record (a shared
 * doorway is listed in both door tables).
 */
const doorRecordPair = (roomId: number, doorIndex: number): [number, number][] => {
  const out: [number, number][] = [[roomId, doorIndex]];
  const door = wasmGetRoomDoorInfo(roomId)[doorIndex];
  if (!door || !outerWall(door.direction, door.row, door.col)) return out;
  const adj = ROOM_EDGE_ADJ[door.direction](roomId);
  if (adj === null) return out;
  const pos = door.direction === 'north' || door.direction === 'south' ? door.col : door.row;
  const twins = wasmGetRoomDoorInfo(adj);
  for (let i = 0; i < twins.length && i < 4; i++) {
    const t = twins[i];
    if (t.direction !== OPPOSITE[door.direction] || t.kind !== door.kind) continue;
    const tpos = t.direction === 'north' || t.direction === 'south' ? t.col : t.row;
    if (Math.abs(tpos - pos) <= 4) out.push([adj, i]);
  }
  return out;
};

/** Unlock a door the way the game would: spend one key on the room's own
 *  record, open the same physical doorway's twin record for free. */
const unlockDoorBothSides = (roomId: number, doorIndex: number, consumeKey: boolean): void => {
  doorRecordPair(roomId, doorIndex).forEach(([r, i], n) => wasmSimUnlockDoor(r, i, n === 0 && consumeKey));
};

/** A trap shutter slamming shut: clear the open bit on both records. */
const closeDoorBothSides = (roomId: number, doorIndex: number): void => {
  for (const [r, i] of doorRecordPair(roomId, doorIndex)) wasmSimCloseDoor(r, i);
};

const labelFor = (itemId: number): string => ITEM_ID_TO_NAME[itemId] ?? `item 0x${itemId.toString(16)}`;

/**
 * Vanilla duplicate-item rule (Link_HandleChest, player.c:3850): chest items
 * with an alternate swap to it when the primary is already owned. Resolved
 * HERE so the delivery label, the sim log AND the granted item all agree —
 * the C hook applies the same rule as a backstop.
 */
const DUPLICATE_ALTERNATES: Record<number, number> = {
  0x0c: 0x44, // Blue Boomerang → 10 Arrows
  0x12: 0x35, // Lamp → 5 Rupees
  0x2a: 0x46, // Red Boomerang → 300 Rupees
};

const resolveDuplicate = (itemId: number): number => {
  const alt = DUPLICATE_ALTERNATES[itemId];
  if (alt === undefined) return itemId;
  const owned = getCurrentInventory().has(ITEM_ID_TO_NAME[itemId] ?? '');
  return owned ? alt : itemId;
};

const trigger = (action: TriggerAction): Promise<void> =>
  new Promise((resolve) => {
    switch (action.type) {
      case 'chest': {
        const itemId = resolveDuplicate(action.itemId);
        enqueue(labelFor(itemId), SOURCE,
          { type: 'trigger_check', roomId: action.roomId, chestIndex: action.chestIndex, itemId },
          resolve);
        return;
      }
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
      case 'door':
        // No item pickup involved — write the bits directly (no queue). A cell
        // lock's "index" is its chest slot, not a door-table slot. Bombable
        // walls blow open without consuming a key; big keys are never consumed.
        if (action.cellLock) wasmSimOpenCellLock(action.roomId, action.doorIndex);
        else unlockDoorBothSides(action.roomId, action.doorIndex, action.doorKind === 'small-key');
        resolve();
        return;
      case 'kill': {
        // Virtual kill: mark the room's drop/cleared bit and grant the drop
        // through the normal receive path; a tag-satisfying kill also opens
        // the room's closed shutter doors, exactly as the game does.
        wasmSimKillDrop(action.roomId, action.itemId);
        if (action.opensShutters) {
          const doors = wasmGetRoomDoorInfo(action.roomId);
          for (let i = 0; i < doors.length && i < 4; i++) {
            if (doors[i].kind === 4 && !doors[i].isOpen) unlockDoorBothSides(action.roomId, i, false);
          }
        }
        resolve();
        return;
      }
      case 'progress':
        // Scripted rescue progression — pure state writes, no item pickup.
        if (action.step === 'zelda-follow') wasmSimZeldaFollow();
        else wasmSimZeldaRescue();
        resolve();
        return;
      case 'pullSwitch': {
        // The room's tag routine raises its trapdoors when a switch is pulled:
        // every shut shutter in the room opens (Behind Sanctuary's door out).
        const doors = wasmGetRoomDoorInfo(action.roomId);
        for (let i = 0; i < doors.length && i < 4; i++) {
          if (doors[i].kind === 4 && !doors[i].isOpen) unlockDoorBothSides(action.roomId, i, false);
        }
        resolve();
        return;
      }
      case 'trapShutters': {
        // Trap doors slam shut behind Link: close every OPEN shutter record.
        const doors = wasmGetRoomDoorInfo(action.roomId);
        for (let i = 0; i < doors.length && i < 4; i++) {
          if (doors[i].kind === 4 && doors[i].isOpen) closeDoorBothSides(action.roomId, i);
        }
        resolve();
        return;
      }
    }
  });

export { trigger };
