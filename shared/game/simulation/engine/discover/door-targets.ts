/* @layer shared-game @kind logic */
import type { SimDoor } from '../../types';
import { ANY_DUNGEON } from '../../dungeon-key-target';
import { keyAvailable } from '../explorer/key-available';
import { hasReachableNeighbor } from '../discover-reach/has-reachable-neighbor';
import { DOOR_REACH_RADIUS } from '../discover-reach/discover-reach.constants';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope, LockedDoorKind } from './discover.type';
import { DOOR_NOUN, DOOR_VERB } from './discover.constants';

const isLockedKind = (kind: SimDoor['kind']): kind is LockedDoorKind =>
  kind === 'small-key' || kind === 'big-key' || kind === 'bombable';

const canOpen = ({ state, hasBombs }: DiscoverScope, kind: LockedDoorKind): boolean => {
  if (kind === 'small-key') return keyAvailable(state, ANY_DUNGEON);
  if (kind === 'big-key') return state.bigKeys.size > 0;
  return hasBombs;
};

const doorTarget = (scope: DiscoverScope, door: SimDoor, kind: LockedDoorKind, key: string): SimTarget | null => {
  const tile = door.tiles[0];
  if (tile && !hasReachableNeighbor(scope.reached, tile, DOOR_REACH_RADIUS)) return null;
  const action = { type: 'door', roomId: door.roomId, doorIndex: door.index, doorKind: kind, ...(door.cellLock ? { cellLock: true } : {}) } as const;
  const noun = door.cellLock ? 'cell lock' : DOOR_NOUN[kind];
  const label = `${noun} (room ${door.roomId.toString(16)} #${door.index})`;
  return { screenId: scope.screenId, roomId: door.roomId, action, key, role: 'gate', label, noun, verb: DOOR_VERB[kind], tile };
};

const doorTargets = (scope: DiscoverScope): SimTarget[] => {
  const { state, inter } = scope;
  const targets: SimTarget[] = [];
  for (const door of inter.doors) {
    const kind = door.kind;
    if (!isLockedKind(kind) || door.opened) continue;
    const key = `door:${door.roomId}:${door.index}`;
    if (state.done.has(key) || state.failed.has(key)) continue;
    if (!canOpen(scope, kind)) continue;
    const target = doorTarget(scope, door, kind, key);
    if (target) targets.push(target);
  }
  return targets;
};

export { doorTargets };
