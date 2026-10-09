/* @layer bridge-wasm @kind types */
import type { GridPos } from '@rotp/game-core';

interface SeedLedger {
  add: (screenIndex: number, tile: GridPos) => boolean;
  list: (screenIndex: number) => GridPos[];
}

export type { SeedLedger };
