/* @layer bridge-wasm @kind logic */
import type { RoomFloodRun } from '../flood-room';
import { wasmGetRoomStairInfoFor } from '@rotp/game-core';
import { getRoomChests, getRoomSprites, getRoomDoors } from '../interactables';
import { ANCHOR_SLACK } from './probe-room-anchors.constants';

const reachedNear = (run: RoomFloodRun, row: number, col: number): boolean => {
  for (let dr = -ANCHOR_SLACK; dr <= ANCHOR_SLACK; dr++) {
    for (let dc = -ANCHOR_SLACK; dc <= ANCHOR_SLACK; dc++) {
      if ((run.result.reachable[row + dr]?.[col + dc] ?? 0) > 0) return true;
    }
  }
  return false;
};

const floodAnchorReport = (roomId: number, run: RoomFloodRun): { total: number; hits: string[]; missed: string[] } => {
  const named = [
    ...getRoomDoors(roomId).flatMap((d) => d.tiles.map((t) => ({ tag: `door:${d.direction}`, ...t }))),
    ...wasmGetRoomStairInfoFor(roomId).map((s) => ({ tag: 'stair', row: s.row, col: s.col })),
    ...getRoomChests(roomId).map((c) => ({ tag: 'chest', ...c.tile })),
    ...getRoomSprites(roomId).map((s) => ({ tag: `sprite:${s.spriteType}`, ...s.tile })),
    ...run.entrances.map((e) => ({ tag: `ent:${e.id}`, row: e.gridRow, col: e.gridCol })),
  ];
  const hits: string[] = [];
  const missed: string[] = [];
  for (const a of named) (reachedNear(run, a.row, a.col) ? hits : missed).push(`${a.tag}@${a.row},${a.col}`);
  return { total: named.length, hits, missed };
};

export { floodAnchorReport };
