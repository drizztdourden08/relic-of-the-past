/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, GridPos, ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
import type { SimExit, EdgeName, RoomExitContext, RoomExitPass } from '@rotp/navigation';
import { wasmGetRoomDoorInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundariesFor } from '..';
import { enrichEntrances, connectionCrossingId, midOf, takeableCrossing, entryFromEdge, OPPOSITE, LAST_ROW, OUTDOOR_LANDING_DEPTH, WARP_DOOR, WARP_SIDES } from '@rotp/navigation';
import { interiorScreenId, owScreenId, screenAreaInfo } from './screen-resolve';

const tailNumber = (id: string): number => Number(id.slice(id.indexOf(':') + 1));
const lastNumber = (id: string): number => Number(id.slice(id.lastIndexOf(':') + 1));

const roomOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'room' ? crossing.target.native.room : null;

const screenOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'overworld' ? crossing.target.native.screen : null;

const stairLandingTile = (destRoom: number, fromRoom: number): GridPos | undefined => {
  const back = wasmGetRoomStairInfoFor(destRoom).find((s) => s.destRoom === fromRoom)
    ?? wasmGetRoomWalkBoundariesFor(destRoom).find((b) => b.destRoom === fromRoom);
  return back ? { row: back.row, col: back.col } : undefined;
};

const stairExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const destRoom = roomOf(crossing);
  if (destRoom === null) return null;
  const landing = stairLandingTile(destRoom, pass.roomIndex);
  return {
    to: interiorScreenId(destRoom, landing, pass.cached),
    ...(landing ? { entryTile: landing } : {}),
    fromTile: crossing.tile,
    twoWay: true,
    origin: 'room-stair',
    edgeSig: `s${tailNumber(crossing.id)}`,
  };
};

const doorExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const id = tailNumber(crossing.id);
  const ow = pass.cached
    ? pass.owSide.find((e) => e.id === id && `^ow:${e.area}` === pass.cached) ?? pass.owSide.find((e) => e.id === id)
    : pass.owSide.find((e) => e.id === id);
  if (!ow) return null;
  const to = pass.cached ? pass.cached.slice(1) : owScreenId(ow.area);
  return {
    to,
    entryTile: { row: Math.min(LAST_ROW, ow.gridRow + OUTDOOR_LANDING_DEPTH), col: ow.gridCol },
    fromTile: crossing.tile,
    twoWay: true,
    origin: 'room-door',
    edgeSig: `e${id}`,
    ...(screenAreaInfo(to) ? { area: screenAreaInfo(to) } : {}),
  };
};

const exitTableExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const exitScreen = screenOf(crossing);
  const owBack = pass.owSide.find((e) => e.roomId === pass.roomIndex);
  if (exitScreen === null || !owBack) return null;
  const to = owScreenId(exitScreen);
  return {
    to,
    entryTile: { row: Math.min(LAST_ROW, owBack.gridRow + OUTDOOR_LANDING_DEPTH), col: owBack.gridCol },
    twoWay: true,
    origin: 'exit-table',
    edgeSig: `x${pass.roomIndex}`,
    ...(screenAreaInfo(to) ? { area: screenAreaInfo(to) } : {}),
  };
};

const warpExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const destRoom = roomOf(crossing);
  const side = crossing.side;
  if (destRoom === null || !side || !WARP_SIDES.includes(side)) return null;
  const back = (wasmGetRoomDoorInfo(destRoom) ?? [])
    .find((d) => d.nativeType === WARP_DOOR && d.direction === OPPOSITE[side as EdgeName]);
  const landing = back ? { row: back.row, col: back.col } : undefined;
  return {
    to: interiorScreenId(destRoom, landing, pass.cached),
    ...(landing ? { entryTile: landing } : {}),
    fromTile: crossing.tile,
    twoWay: true,
    origin: 'room-warp',
    edgeSig: `w${side}`,
  };
};

const doorwayExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const adj = roomOf(crossing);
  const side = crossing.side as EdgeName | undefined;
  if (adj === null || !side) return null;
  const pos = lastNumber(crossing.id);
  const landing = entryFromEdge(side, pos);
  return {
    to: interiorScreenId(adj, landing, pass.cached),
    entryTile: landing,
    fromTile: crossing.tile,
    twoWay: true,
    origin: 'room-doorway',
    edgeSig: `d${side}:${pos}`,
  };
};

const borderExit = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  const adj = roomOf(crossing);
  const connection = pass.bundles.get(crossing.id);
  if (adj === null || !connection) return null;
  const landing = entryFromEdge(connection.edge, midOf(connection.positions));
  return {
    to: interiorScreenId(adj, landing, pass.cached),
    entryTile: landing,
    fromTile: crossing.tile,
    twoWay: true,
    origin: 'room-border',
    edgeSig: crossing.id.slice('edge:'.length),
  };
};

const roomExitFor = (crossing: ScreenCrossing, pass: RoomExitPass): SimExit | null => {
  if (crossing.class === 'edge') return borderExit(crossing, pass);
  switch (crossing.origin) {
    case 'room-stair':
    case 'room-border': return stairExit(crossing, pass);
    case 'room-door': return doorExit(crossing, pass);
    case 'exit-table': return exitTableExit(crossing, pass);
    case 'warp-slot': return warpExit(crossing, pass);
    case 'room-doorway': return doorwayExit(crossing, pass);
    default: return null;
  }
};

const roomCrossingExits = (crossings: ScreenCrossings, context: RoomExitContext): SimExit[] => {
  const bundles = new Map<string, ConnectionInfo>();
  for (const connection of context.connections) bundles.set(connectionCrossingId(connection), connection);
  const pass: RoomExitPass = { ...context, owSide: enrichEntrances(), bundles };
  const out: SimExit[] = [];
  for (const crossing of [...crossings.entrances, ...crossings.edges]) {
    if (!takeableCrossing(crossing)) continue;
    const exit = roomExitFor(crossing, pass);
    if (exit) out.push(exit);
  }
  return out;
};

export { roomCrossingExits };
export type { RoomExitContext } from '@rotp/navigation';
