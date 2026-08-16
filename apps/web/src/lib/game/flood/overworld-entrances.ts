/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@shared/game/navigation';
import {
  wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetEntranceRooms, wasmGetAreaHeads,
} from '../';

/** Merged fall-hole ids start here, so a hole never collides with a door id. */
const FALL_HOLE_ID_BASE = 200;
const SUB_SCREEN = 64;

interface SubScreenPos {
  area: number;
  gridRow: number;
  gridCol: number;
}

/** A 2×2 group records its entrances on the HEAD area, in 128×128 coordinates. */
const resolveToSubScreen = (heads: Uint8Array | null, area: number, bigRow: number, bigCol: number): SubScreenPos => {
  if (!heads || heads[area] !== area) return { area, gridRow: bigRow, gridCol: bigCol };
  const isBig = heads.some((h, i) => h === area && i !== area);
  if (!isBig || (bigRow < SUB_SCREEN && bigCol < SUB_SCREEN)) return { area, gridRow: bigRow, gridCol: bigCol };
  const subRow = bigRow >= SUB_SCREEN ? 1 : 0;
  const subCol = bigCol >= SUB_SCREEN ? 1 : 0;
  return {
    area: ((((area >> 3) & 7) + subRow) << 3) | ((area & 7) + subCol),
    gridRow: bigRow - subRow * SUB_SCREEN,
    gridCol: bigCol - subCol * SUB_SCREEN,
  };
};

/**
 * THE overworld entrance list: every door and pit on the surface, each on the
 * 64×64 tile grid of the sub-screen it physically sits on.
 *
 * Fall holes are merged in at `FALL_HOLE_ID_BASE + id`; their recorded row is
 * offset by -8, which is added back here.
 */
const enrichEntrances = (): OverworldEntrance[] => {
  const raw = wasmGetOverworldEntrances();
  const rooms = wasmGetEntranceRooms();
  const heads = wasmGetAreaHeads();

  const entrances: OverworldEntrance[] = raw.map((e) => ({
    ...resolveToSubScreen(heads, e.area, (e.pos >> 7) * 2, ((e.pos & 0x7f) >> 1) * 2),
    pos: e.pos,
    id: e.id,
    roomId: rooms?.[e.id] ?? 0,
  }));
  for (const hole of wasmGetFallHoles()) {
    entrances.push({
      ...resolveToSubScreen(heads, hole.area, ((hole.pos >> 7) + 8) * 2, ((hole.pos & 0x7f) >> 1) * 2),
      pos: hole.pos,
      id: FALL_HOLE_ID_BASE + hole.entranceId,
      roomId: rooms?.[hole.entranceId] ?? 0,
    });
  }
  return entrances;
};

export { enrichEntrances, FALL_HOLE_ID_BASE };
