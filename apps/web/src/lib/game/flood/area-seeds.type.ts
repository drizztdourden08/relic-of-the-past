/* @layer bridge-wasm @kind types */
import type { GridPos } from '@shared/game/navigation';

interface SeedLedger {
  add: (screenIndex: number, tile: GridPos) => boolean;
  list: (screenIndex: number) => GridPos[];
}

export type { SeedLedger };
