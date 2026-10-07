/* @layer shared-game @kind logic */
/**
 * Three attribute ranges pack a room-local slot index into their low nibble
 * (or, for chests, `attr - 0x58`); the tile's real identity lives in a live
 * side-table the caller supplies, never in the attribute byte itself. When a
 * family matches but the table has no record for that slot, the tile stays
 * honestly unresolved. Asserting a guess is exactly the bug this module
 * exists to avoid.
 */
import { MANIPULABLE_NAMES } from '../../data/native-tables';
import type { TileBehavior } from '../../data/types';
import type { SimDoor } from '../../simulation';
import type { TileInteractable } from './types';

interface ResolveInteractableParams {
  attr: number;
  behavior: TileBehavior;
  replacementTileState: readonly number[];
  chestLocations: readonly number[];
  doors: readonly SimDoor[];
}

const resolveDoor = (attr: number, doors: readonly SimDoor[]): TileInteractable | undefined => {
  const slot = attr & 0x0f;
  const door = doors.find(d => d.index === slot);
  if (!door) return undefined;

  return { family: 'door', source: 'door-table', slot, kind: door.kind, state: door.opened ? 'open' : 'shut' };
};

const resolveManipulable = (attr: number, replacementTileState: readonly number[]): TileInteractable | undefined => {
  const slot = attr & 0x0f;
  if (slot >= replacementTileState.length) return undefined;

  const kind = MANIPULABLE_NAMES[replacementTileState[slot] & 0xf0f0];
  if (!kind) return undefined;

  return { family: 'manipulable', source: 'replacement-tile-state', slot, kind, state: 'unknown' };
};

const resolveChest = (attr: number, behavior: TileBehavior, chestLocations: readonly number[]): TileInteractable | undefined => {
  const slot = attr - 0x58;
  if (slot < 0 || slot >= chestLocations.length) return undefined;

  const shut = chestLocations[slot] >= 0x8000;
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
export type { ResolveInteractableParams };
