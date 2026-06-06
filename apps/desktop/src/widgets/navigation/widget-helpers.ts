/** Data-prep helpers for the Navigation widget (pure + wasm-backed). */
import { getScreenLookup } from '@shared/game/data/screens';
import type { OverworldEntrance } from '@shared/game/navigation';
import {
  wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetEntranceRooms, wasmGetAreaHeads,
} from '../../lib/game';
import type { ViewportInfo } from '../../lib/game';

/** Get overworld screen display name from screen index. */
const getScreenDisplayName = (screenIndex: number): string =>
  getScreenLookup().byOverworldScreen.get(screenIndex)?.name ?? `0x${screenIndex.toString(16).toUpperCase()}`;

/** Convert flat Uint8Array (4096 bytes) to 64×64 number[][] grid. */
const uint8ToGrid = (raw: Uint8Array): number[][] => {
  const grid: number[][] = new Array(64);
  for (let r = 0; r < 64; r++) {
    grid[r] = new Array(64);
    for (let c = 0; c < 64; c++) {
      grid[r][c] = raw[r * 64 + c];
    }
  }
  return grid;
};

/** Enrich raw wasm entrance data with gridRow/gridCol/roomId for the orchestrator. */
const enrichEntrances = (): OverworldEntrance[] => {
  const raw = wasmGetOverworldEntrances();
  const holes = wasmGetFallHoles();
  const rooms = wasmGetEntranceRooms();
  const heads = wasmGetAreaHeads();

  // For big screens (2×2 groups), entrances store the HEAD area and 128×128 coords.
  // Resolve each entrance to its correct sub-screen with 64×64 local coordinates.
  const resolveToSubScreen = (area: number, bigRow: number, bigCol: number): { area: number; gridRow: number; gridCol: number } => {
    if (!heads) return { area, gridRow: bigRow, gridCol: bigCol };
    const head = heads[area];
    if (head === area) {
      const isBig = heads.some((h, i) => h === area && i !== area);
      if (isBig && (bigRow >= 64 || bigCol >= 64)) {
        const headRow = (area >> 3) & 7;
        const headCol = area & 7;
        const subRow = bigRow >= 64 ? 1 : 0;
        const subCol = bigCol >= 64 ? 1 : 0;
        const subScreen = ((headRow + subRow) << 3) | (headCol + subCol);
        return { area: subScreen, gridRow: bigRow - subRow * 64, gridCol: bigCol - subCol * 64 };
      }
    }
    return { area, gridRow: bigRow, gridCol: bigCol };
  };

  const entrances: OverworldEntrance[] = raw.map(e => {
    const bigRow = (e.pos >> 7) * 2;
    const bigCol = ((e.pos & 0x7F) >> 1) * 2;
    const resolved = resolveToSubScreen(e.area, bigRow, bigCol);
    return { area: resolved.area, pos: e.pos, id: e.id, gridRow: resolved.gridRow, gridCol: resolved.gridCol, roomId: rooms?.[e.id] ?? 0 };
  });
  // Merge fall holes (pits that lead to rooms) — id offset 200+ to avoid collision.
  // Fall hole pos stores row offset by -8; add 8 back.
  for (const h of holes) {
    const bigRow = ((h.pos >> 7) + 8) * 2;
    const bigCol = ((h.pos & 0x7F) >> 1) * 2;
    const resolved = resolveToSubScreen(h.area, bigRow, bigCol);
    entrances.push({ area: resolved.area, pos: h.pos, id: 200 + h.entranceId, gridRow: resolved.gridRow, gridCol: resolved.gridCol, roomId: rooms?.[h.entranceId] ?? 0 });
  }
  return entrances;
};

/** Compute big-screen group from the WASM area-heads table. */
const computeBigScreenGroup = (screenIndex: number): number[] => {
  const heads = wasmGetAreaHeads();
  if (!heads) return [screenIndex];
  const myHead = heads[screenIndex];
  if (myHead === undefined) return [screenIndex];
  const group: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (heads[i] === myHead) group.push(i);
  }
  return group.length > 0 ? group : [screenIndex];
};

/** Overworld screen indices currently visible in the viewport. */
const getVisibleOverworldScreenIndices = (vp: ViewportInfo): number[] => {
  const viewLeft = vp.cameraX - vp.extraLeftRight;
  const viewTop = vp.cameraY;
  const viewRight = viewLeft + vp.snesWidth - 1;
  const viewBottom = viewTop + vp.snesHeight - 1;
  const minCol = Math.max(0, Math.min(7, Math.floor(viewLeft / 512)));
  const maxCol = Math.max(0, Math.min(7, Math.floor(viewRight / 512)));
  const minRow = Math.max(0, Math.min(7, Math.floor(viewTop / 512)));
  const maxRow = Math.max(0, Math.min(7, Math.floor(viewBottom / 512)));
  const out: number[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      out.push((r << 3) | c);
    }
  }
  return out;
};

export { getScreenDisplayName, uint8ToGrid, enrichEntrances, computeBigScreenGroup, getVisibleOverworldScreenIndices };
