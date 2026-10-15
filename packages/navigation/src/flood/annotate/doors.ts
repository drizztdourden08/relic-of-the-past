/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation, SimDoor } from '../../simulation';
import { DOOR_KIND, REQUIRES, THRONE_DOOR } from './doors.constants';
import type { DoorContext } from './doors.type';

const throneGate = (ctx: DoorContext): Pick<ScreenAnnotation, 'kind' | 'label' | 'state' | 'detail'> => (ctx.followerReady
  ? { kind: 'follower-gate', label: 'throne passage', state: 'open' }
  : { kind: 'follower-gate', label: 'throne passage', state: 'shut', detail: 'needs the follower in tow' });

const cellLock = (door: SimDoor): Pick<ScreenAnnotation, 'kind' | 'label' | 'state' | 'requires'> =>
  ({ kind: 'cell-lock', label: `cell lock #${door.index}`, state: door.opened ? 'open' : 'shut', requires: ['bigkey:*'] });

const doorAnnotation = (door: SimDoor, ctx: DoorContext): ScreenAnnotation | null => {
  const tile = door.tiles[0];
  if (!tile) return null;
  const base = { tile, direction: door.direction, ...(door.layer !== undefined ? { layer: door.layer } : {}) };

  if (door.cellLock) return { ...base, ...cellLock(door) };
  if (door.nativeType === THRONE_DOOR) return { ...base, ...throneGate(ctx) };
  const kind = DOOR_KIND[door.kind];
  if (!kind) return null;
  const requires = REQUIRES[kind];
  const trap = kind === 'shutter' && ctx.killGated;
  return {
    ...base, kind, label: `${kind.replace('-', ' ')} #${door.index}`,
    state: door.opened ? 'open' : 'shut',
    ...(requires ? { requires } : {}),
    ...(trap ? { detail: 'closes behind you, clear the room to reopen' } : {}),
  };
};

export { doorAnnotation };
