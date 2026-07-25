/* @layer bridge-wasm @kind logic */
/**
 * One door record → one annotation. Doors that share a `kind` are separated by
 * their raw kDoorType (the throne push wall and a warp door are both 'normal'),
 * and cell locks are not door-table records at all.
 *
 * A shutter in a kill-gate room carries WHY it is shut: those are the trap
 * shutters that close behind the player and only reopen when the room is cleared.
 */
import type { ScreenAnnotation, AnnotationKind } from '@shared/game/simulation';
import type { SimDoor } from '@shared/game/simulation';

/** kDoorType_ThroneRoom — the push wall that needs the follower in tow. */
const THRONE_DOOR = 0x14;
/** kDoorType_WarpRoomDoor — crossing teleports to a header travel destination. */
const WARP_DOOR = 0x46;

const DOOR_KIND: Partial<Record<SimDoor['kind'], AnnotationKind>> = {
  'small-key': 'key-door',
  'big-key': 'big-key-door',
  bombable: 'bombable',
  shutter: 'shutter',
};

const REQUIRES: Partial<Record<AnnotationKind, string[]>> = {
  'key-door': ['smallkey:*'],
  'big-key-door': ['bigkey:*'],
  bombable: ['bombs'],
};

interface DoorContext {
  /** The follower is in tow, so the throne push wall will open. */
  followerReady: boolean;
  /** The room's doors open by clearing it — shutters here are the trap kind. */
  killGated: boolean;
}

const doorAnnotation = (door: SimDoor, ctx: DoorContext): ScreenAnnotation | null => {
  const tile = door.tiles[0];
  if (!tile) return null;
  const base = { tile, ...(door.layer !== undefined ? { layer: door.layer } : {}) };

  if (door.cellLock) {
    return { ...base, kind: 'cell-lock', label: `cell lock #${door.index}`,
      state: door.opened ? 'open' : 'shut', requires: ['bigkey:*'] };
  }
  if (door.nativeType === THRONE_DOOR) {
    return { ...base, kind: 'follower-gate', label: 'throne passage',
      state: ctx.followerReady ? 'open' : 'shut',
      ...(ctx.followerReady ? {} : { detail: 'needs the follower in tow' }) };
  }
  if (door.nativeType === WARP_DOOR) {
    return { ...base, kind: 'warp-door', label: 'warp door', state: 'open' };
  }

  const kind = DOOR_KIND[door.kind];
  if (!kind) return null;
  const requires = REQUIRES[kind];
  const trap = kind === 'shutter' && ctx.killGated;
  return {
    ...base, kind, label: `${kind.replace('-', ' ')} #${door.index}`,
    state: door.opened ? 'open' : 'shut',
    ...(requires ? { requires } : {}),
    ...(trap ? { detail: 'closes behind you — clear the room to reopen' } : {}),
  };
};

export { doorAnnotation, THRONE_DOOR, WARP_DOOR };
export type { DoorContext };
