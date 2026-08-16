/* @layer renderer-widgets @kind logic */
/** Data-prep helpers for the Navigation widget (pure + wasm-backed). */
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { wasmGetAreaHeads } from '../../../../lib/game';

/** Get overworld screen display name from screen index. */
const getScreenDisplayName = (screenIndex: number): string => {
  const screen = getScreenLookup().byOverworldScreen.get(screenIndex);
  return screen ? (screen.vanillaName ?? screen.randomizerName) : `0x${screenIndex.toString(16).toUpperCase()}`;
};

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

export { getScreenDisplayName, uint8ToGrid, computeBigScreenGroup };
