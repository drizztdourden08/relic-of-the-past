/* @layer shared-game @kind logic */
import type { TileBehavior } from '@rotp/game-data';
import type { SimDoor } from '../../simulation';
import type { ResolveInteractableParams, TileInteractable } from './tile-classification.type';
import { MANIPULABLE_NAMES } from '@rotp/game-data';
import { itemAt } from '../../checked-access';
import { CHEST_ATTR_BASE, CHEST_SHUT_FLAG, MANIPULABLE_KIND_MASK, SLOT_MASK } from './tile-classification.constants';

const resolveDoor = (attr: number, doors: readonly SimDoor[]): TileInteractable | undefined => {
  const slot = attr & SLOT_MASK;
  const door = doors.find(d => d.index === slot);
  if (!door) return undefined;

  return { family: 'door', source: 'door-table', slot, kind: door.kind, state: door.opened ? 'open' : 'shut' };
};

const resolveManipulable = (attr: number, replacementTileState: readonly number[]): TileInteractable | undefined => {
  const slot = attr & SLOT_MASK;
  if (slot >= replacementTileState.length) return undefined;

  const kind = MANIPULABLE_NAMES[itemAt(replacementTileState, slot) & MANIPULABLE_KIND_MASK];
  if (!kind) return undefined;

  return { family: 'manipulable', source: 'replacement-tile-state', slot, kind, state: 'unknown' };
};

const resolveChest = (attr: number, behavior: TileBehavior, chestLocations: readonly number[]): TileInteractable | undefined => {
  const slot = attr - CHEST_ATTR_BASE;
  if (slot < 0 || slot >= chestLocations.length) return undefined;

  const shut = itemAt(chestLocations, slot) >= CHEST_SHUT_FLAG;
  return { family: 'chest', source: 'chest-locations', slot, kind: behavior, state: shut ? 'shut' : 'open' };
};

const resolveInteractable = (params: ResolveInteractableParams): TileInteractable | undefined => {
  const { attr, behavior, replacementTileState, chestLocations, doors } = params;

  if (behavior === 'flaggable-door') return resolveDoor(attr, doors);
  if (behavior === 'manipulably-replaced') return resolveManipulable(attr, replacementTileState);
  if (behavior === 'chest' || behavior === 'minigame-chest') return resolveChest(attr, behavior, chestLocations);
  return undefined;
};

export { resolveInteractable };
export type { ResolveInteractableParams } from './tile-classification.type';
