/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation, ScreenAnnotations, ScreenTag } from '../simulation';
import type { SimLocation } from '../simulation';
import type { ReachState } from '@rotp/game-core';
import { roomTagName } from '../simulation';
import { getRoomChests, getRoomDoors, getRoomSprites, getOverworldSprites } from '../simulator/interactables';
import { wasmGetRoomTagsFor } from '@rotp/game-core';
import { isFollowerActive } from '@rotp/game-core';
import { getCompletedChecks } from '../tracker/bridge/get-completed-checks';
import { getCurrentInventory } from '../tracker/bridge/get-current-inventory';
import type { CheckId, ItemId } from '@rotp/game-data';
import { doorAnnotation } from './annotate/doors';
import { spriteAnnotation } from './annotate/sprites';
import { chestAnnotation } from './annotate/chests';
import { isKillGateTag } from './annotate/is-kill-gate-tag';
import { tallyChecks } from './annotate/tally-checks';
import { markUnreachable } from './annotate/reachability';

const hex = (n: number): string => n.toString(16);

const annotateRoom = (roomId: number, items: ScreenAnnotation[], completed: ReadonlySet<CheckId>, inventory: ReadonlySet<ItemId>): ScreenTag[] => {
  const followerReady = isFollowerActive();

  for (const chest of getRoomChests(roomId)) {
    if (!chest.posKnown) continue;
    items.push(chestAnnotation(chest, inventory));
  }

  const tags = wasmGetRoomTagsFor(roomId);
  const killGated = tags.some(isKillGateTag);
  if (killGated) {
    items.push({ kind: 'kill-trigger', tile: { row: 0, col: 0 },
      label: 'clear the room to open its doors',
      detail: `tags ${tags.filter((t) => t !== 0).map((t) => `0x${hex(t)}`).join(', ')}` });
  }

  const doors = getRoomDoors(roomId);
  for (const door of doors) {
    const a = doorAnnotation(door, { followerReady, killGated });
    if (a) items.push(a);
  }

  const shutterCount = doors.filter((d) => d.kind === 'shutter').length;
  for (const sprite of getRoomSprites(roomId)) {
    const a = spriteAnnotation(sprite, { roomId, completed, shutterCount });
    if (a) items.push(a);
  }

  return tags.filter((t) => t !== 0).map((t) => ({ value: t, name: roomTagName(t) }));
};

const annotateOverworld = (screenIndex: number, items: ScreenAnnotation[], completed: ReadonlySet<CheckId>): void => {
  for (const sprite of getOverworldSprites(screenIndex)) {
    const ownedByNeighbour = sprite.roomId !== screenIndex;
    if (ownedByNeighbour) continue;
    const a = spriteAnnotation(sprite, { roomId: -1, completed, shutterCount: 0 });
    if (a) items.push(a);
  }
};

const annotateScreen = (
  screenId: string,
  loc: SimLocation,
  reachable?: readonly ReachState[][],
): ScreenAnnotations => {
  const items: ScreenAnnotation[] = [];
  const completed = getCompletedChecks();

  let tags: ScreenTag[] = [];
  if (loc.isIndoors) tags = annotateRoom(loc.roomId, items, completed, getCurrentInventory());
  else annotateOverworld(loc.owScreenIndex, items, completed);

  markUnreachable(items, reachable);

  return {
    screenId,
    screenIndex: loc.isIndoors ? loc.roomId : loc.owScreenIndex,
    items,
    checks: tallyChecks(items),
    ...(tags.length ? { tags } : {}),
  };
};

export { annotateScreen };
