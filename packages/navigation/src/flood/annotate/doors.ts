/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { AnnotationKind, ScreenAnnotation, SimDoor } from '../../simulation';
import { DOOR_KIND, DOOR_LABELS, REQUIRES, THRONE_DOOR } from './doors.constants';
import type { DoorContext } from './doors.type';

const throneGate = (ctx: DoorContext): Pick<ScreenAnnotation, 'kind' | 'label' | 'state' | 'detail'> => (ctx.followerReady
  ? { kind: 'follower-gate', label: msg('nav-labels:label.throne'), state: 'open' }
  : { kind: 'follower-gate', label: msg('nav-labels:label.throne'), state: 'shut', detail: msg('nav-labels:detail.throne') });

const cellLock = (door: SimDoor): Pick<ScreenAnnotation, 'kind' | 'label' | 'state' | 'requires'> =>
  ({ kind: 'cell-lock', label: msg('nav-labels:label.cellLock', { index: door.index }), state: door.opened ? 'open' : 'shut', requires: ['bigkey:*'] });

const standardDoor = (door: SimDoor, ctx: DoorContext, kind: AnnotationKind): Partial<ScreenAnnotation> => {
  const requires = REQUIRES[kind];
  const trap = kind === 'shutter' && ctx.killGated;
  return {
    label: DOOR_LABELS[kind]?.(door.index) ?? kind,
    state: door.opened ? 'open' : 'shut',
    ...(requires ? { requires } : {}),
    ...(trap ? { detail: msg('nav-labels:detail.trap') } : {}),
  };
};

const doorBase = (door: SimDoor, tile: NonNullable<SimDoor['tiles'][number]>) =>
  ({ tile, direction: door.direction, ...(door.layer !== undefined ? { layer: door.layer } : {}) });

const doorAnnotation = (door: SimDoor, ctx: DoorContext): ScreenAnnotation | null => {
  const tile = door.tiles[0];
  if (!tile) return null;
  const base = doorBase(door, tile);

  if (door.cellLock) return { ...base, ...cellLock(door) };
  if (door.nativeType === THRONE_DOOR) return { ...base, ...throneGate(ctx) };
  const kind = DOOR_KIND[door.kind];
  if (!kind) return null;
  return { ...base, kind, label: kind, ...standardDoor(door, ctx, kind) };
};

export { doorAnnotation };
