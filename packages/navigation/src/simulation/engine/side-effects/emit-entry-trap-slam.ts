/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SimDoor, SimEvent, SimObservation } from '../../types';
import { isClearRoomTag } from '../../is-clear-room-tag';
import { narrative } from '../event-log/narrative';
import { TRAP_ENTRY_RADIUS } from '../engine.constants';
import type { EngineState } from '../state/state.type';

const nearTile = (a: GridPos, b: GridPos): boolean =>
  Math.abs(a.row - b.row) <= TRAP_ENTRY_RADIUS && Math.abs(a.col - b.col) <= TRAP_ENTRY_RADIUS;

const isClosedShutterNear = (door: SimDoor, tile: GridPos): boolean =>
  door.kind === 'shutter' && !door.opened && door.tiles.some((t) => nearTile(t, tile));

const emitEntryTrapSlam = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  const inter = obs.interactables;
  if (!inter || !(inter.tags ?? [0, 0]).some(isClearRoomTag)) return;
  const near = inter.doors.find((d) => isClosedShutterNear(d, s.virtual.tile));
  if (near) events.push(narrative(s, `Shutter door slammed shut behind the player (room ${near.roomId.toString(16)})`));
};

export { emitEntryTrapSlam };
