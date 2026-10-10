/* @layer bridge-wasm @kind logic */
import type { TriggerAction } from '../simulation';
import type { QueuedAction } from './trigger.type';
import { itemLabel, resolveDuplicate } from '@rotp/game-data';
import { enqueue } from '@rotp/randomizer';
import { wasmTriggerOverworldCheck, wasmGetRoomDoorInfo, wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue, wasmSimOpenCellLock, wasmSimPushMantle, wasmSimMarkMapIcons } from '@rotp/game-core';
import { getCurrentInventory } from '../tracker/bridge/get-current-inventory';
import { outerWall, OPPOSITE, ROOM_EDGE_ADJ } from './room-doorways';
import { markBombed } from '../flood/bombed-walls/mark-bombed';
import {
  DOOR_RECORD_SLOTS, NO_ITEM, NO_SPRITE, SHUTTER_DOOR_KIND, SOURCE, TWIN_DOOR_TOLERANCE,
} from './trigger.constants';

const doorRecordPair = (roomId: number, doorIndex: number): [number, number][] => {
  const out: [number, number][] = [[roomId, doorIndex]];
  const door = (wasmGetRoomDoorInfo(roomId) ?? [])[doorIndex];
  if (!door || !outerWall(door.direction, door.row, door.col)) return out;
  const adj = ROOM_EDGE_ADJ[door.direction](roomId);
  if (adj === null) return out;
  const pos = door.direction === 'north' || door.direction === 'south' ? door.col : door.row;
  const twins = wasmGetRoomDoorInfo(adj) ?? [];
  for (const [i, t] of twins.slice(0, DOOR_RECORD_SLOTS).entries()) {
    if (t.direction !== OPPOSITE[door.direction] || t.kind !== door.kind) continue;
    const tpos = t.direction === 'north' || t.direction === 'south' ? t.col : t.row;
    if (Math.abs(tpos - pos) <= TWIN_DOOR_TOLERANCE) out.push([adj, i]);
  }
  return out;
};

const unlockDoorBothSides = (roomId: number, doorIndex: number, consumeKey: boolean): void => {
  doorRecordPair(roomId, doorIndex).forEach(([r, i], n) => wasmSimUnlockDoor(r, i, n === 0 && consumeKey));
};

const closeDoorBothSides = (roomId: number, doorIndex: number): void => {
  for (const [r, i] of doorRecordPair(roomId, doorIndex)) wasmSimCloseDoor(r, i);
};

const forEachShutter = (roomId: number, wantOpen: boolean, apply: (index: number) => void): void => {
  const doors = wasmGetRoomDoorInfo(roomId) ?? [];
  for (const [i, door] of doors.slice(0, DOOR_RECORD_SLOTS).entries()) {
    if (door.kind === SHUTTER_DOOR_KIND && Boolean(door.isOpen) === wantOpen) apply(i);
  }
};

const openShutShutters = (roomId: number): void =>
  forEachShutter(roomId, false, (i) => unlockDoorBothSides(roomId, i, false));

const runProgressStep = (step: Extract<TriggerAction, { type: 'progress' }>['step']): void => {
  if (step === 'follower-join') wasmSimFollowerAttach();
  else if (step === 'shelf-push') wasmSimPushMantle();
  else if (step === 'sage-quest') wasmSimMarkMapIcons();
  else wasmSimFollowerRescue();
};

const enqueueAction = (action: QueuedAction, resolve: () => void): void => {
  switch (action.type) {
    case 'chest': {
      const itemId = resolveDuplicate(action.itemId, getCurrentInventory());
      enqueue(itemLabel(itemId), SOURCE,
        { type: 'trigger_check', roomId: action.roomId, chestIndex: action.chestIndex, itemId },
        resolve);
      return;
    }
    case 'npc':
      enqueue(itemLabel(action.itemId), SOURCE,
        { type: 'trigger_npc_check', flagType: action.flagType, flagMask: action.flagMask, itemId: action.itemId, spriteType: NO_SPRITE, postGfx: 0 },
        resolve);
      return;
    case 'overworld':
      enqueue(itemLabel(action.itemId), SOURCE,
        { type: 'custom', execute: () => wasmTriggerOverworldCheck(action.screen, action.mask, action.itemId) },
        resolve);
      return;
    case 'boss':
      enqueue(`boss room 0x${action.roomId.toString(16)}`, SOURCE,
        { type: 'trigger_check', roomId: action.roomId, chestIndex: 0, itemId: action.itemId },
        action.prizeId ? undefined : resolve);
      if (action.prizeId) {
        enqueue(itemLabel(action.prizeId), SOURCE, { type: 'give_item', itemId: action.prizeId }, resolve);
      }
  }
};

const runImmediate = (action: Exclude<TriggerAction, QueuedAction>): void => {
  switch (action.type) {
    case 'door':
      if (action.cellLock) wasmSimOpenCellLock(action.roomId, action.doorIndex);
      else unlockDoorBothSides(action.roomId, action.doorIndex, action.doorKind === 'small-key');
      return;
    case 'kill':
      wasmSimKillDrop(action.roomId, action.itemId);
      if (action.opensShutters) openShutShutters(action.roomId);
      return;
    case 'progress':
      runProgressStep(action.step);
      return;
    case 'pullSwitch':
      openShutShutters(action.roomId);
      if (action.drain) wasmTriggerOverworldCheck(action.drain.screen, action.drain.mask, NO_ITEM);
      return;
    case 'bombWall':
      markBombed(action.roomId, action.tile);
      return;
    case 'trapShutters':
      forEachShutter(action.roomId, true, (i) => closeDoorBothSides(action.roomId, i));
  }
};

const isQueued = (action: TriggerAction): action is QueuedAction =>
  action.type === 'chest' || action.type === 'npc' || action.type === 'overworld' || action.type === 'boss';

const trigger = (action: TriggerAction): Promise<void> =>
  new Promise((resolve) => {
    if (isQueued(action)) {
      enqueueAction(action, resolve);
      return;
    }
    runImmediate(action);
    resolve();
  });

export { trigger };
