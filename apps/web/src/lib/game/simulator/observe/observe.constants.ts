/* @layer bridge-wasm @kind constants */
import type { VirtualPlayer } from '@shared/game/simulation';

const IDLE_VIRTUAL: VirtualPlayer = { screenId: 'unknown', tile: { row: 0, col: 0 } };

const TILE_REQS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot', 'bombs'];

const ENTRY_REGION_SHIFT = 4;

export { IDLE_VIRTUAL, TILE_REQS, ENTRY_REGION_SHIFT };
