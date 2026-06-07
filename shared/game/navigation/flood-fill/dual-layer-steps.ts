/* @layer shared-game @kind logic */
/** Cross-layer transition handlers for the dual-layer BFS: ledge-fall and stair-traverse. */
import type { TilePassability } from '../types';
import { GRID_SIZE } from '../types';
import { bodyTiles, evaluateEntry, SWAP_STAIR_ATTRS } from './bfs-helpers';

type DualLayerFloodCell = { row: number; col: number; layer: 0 | 1; requirements: Set<string> };
type BodyReached = [(Set<string> | null)[][], (Set<string> | null)[][]];
type TraversedStair = { layer: 0 | 1; row: number; col: number; reqs: Set<string> };

interface StepBounds { minR: number; maxR: number; minC: number; maxC: number }

interface LedgeFallArgs extends StepBounds {
  grids: [TilePassability[][], TilePassability[][]];
  requirements: Set<string>;
  inventory: Set<string>;
  nr: number; nc: number; dr: number; dc: number;
  deque: DualLayerFloodCell[];
  bodyReached: BodyReached;
}

interface StairArgs extends LedgeFallArgs {
  layer: 0 | 1;
  rawAttrs: [number[][], number[][]];
  traversedStairTiles: TraversedStair[];
}

// Ledge in fall direction → cross-layer transition to layer 1.
// Scan forward past the cliff face until the body no longer overlaps any
// ledge tile on layer 0, and all body tiles are passable on layer 1.
const processLedgeFall = (args: LedgeFallArgs): void => {
  const { grids, requirements, inventory, nr, nc, dr, dc, minR, maxR, minC, maxC, deque, bodyReached } = args;
  const targetGrid = grids[1];
  const layer0Grid = grids[0];
  for (let step = 0; step < GRID_SIZE; step++) {
    const lr = nr + step * dr;
    const lc = nc + step * dc;
    if (lr < minR || lr + 1 > maxR || lc < minC || lc + 1 > maxC) break;
    // Body must be fully past the cliff on layer 0
    let stillOnCliff = false;
    for (const [br, bc] of bodyTiles(lr, lc)) {
      if (layer0Grid[br][bc].type === 'ledge') { stillOnCliff = true; break; }
    }
    if (stillOnCliff) continue;
    // Check passability on layer 1
    let canLand = true;
    let newReqs = requirements;
    for (const [br, bc] of bodyTiles(lr, lc)) {
      const tile = targetGrid[br][bc];
      const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
      if (!entry.canEnter) { canLand = false; break; }
      if (entry.newReqs !== newReqs) {
        newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
        for (const req of entry.newReqs) newReqs.add(req);
      }
    }
    if (canLand) {
      const existingReqs = bodyReached[1][lr][lc];
      if (existingReqs === null || existingReqs.size > newReqs.size) {
        bodyReached[1][lr][lc] = newReqs;
        if (newReqs === requirements) {
          deque.unshift({ row: lr, col: lc, layer: 1, requirements: newReqs });
        } else {
          deque.push({ row: lr, col: lc, layer: 1, requirements: newReqs });
        }
      }
      break;
    }
  }
};

// Stair detection: entering stair tiles triggers auto-traverse to the other layer.
// BFS cannot stand on stair tiles — it scans past them and lands at the first
// free 2×2 on the other layer. Stairs can only be entered vertically (north/south).
const processStairTraversal = (args: StairArgs): void => {
  const { layer, grids, rawAttrs, requirements, inventory, nr, nc, dr, dc, minR, maxR, minC, maxC, deque, bodyReached, traversedStairTiles } = args;
  // Side entry (east/west) is blocked — stair corridor has walls on sides
  if (dc !== 0) return;

  const otherLayer = (1 - layer) as 0 | 1;
  const targetGrid = grids[otherLayer];
  // Scan forward in movement direction. Skip positions where body overlaps
  // stair tiles (Link can't stand on stairs — they're auto-traverse).
  // Keep scanning through impassable tiles (void corridor between stair
  // and floor). Land at first position that's both off-stairs AND passable.
  const stairTiles: [number, number][] = [];
  for (let step = 0; step < GRID_SIZE; step++) {
    const lr = nr + step * dr;
    const lc = nc + step * dc;
    if (lr < minR || lr + 1 > maxR || lc < minC || lc + 1 > maxC) break;
    // Body must not overlap any stair tile (check both layers' raw attrs)
    let onStair = false;
    for (const [br, bc] of bodyTiles(lr, lc)) {
      if (SWAP_STAIR_ATTRS.has(rawAttrs[0][br]?.[bc]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][br]?.[bc])) {
        onStair = true;
        stairTiles.push([br, bc]);
      }
    }
    if (onStair) continue;
    // Check passability on other layer at this position
    let canLand = true;
    let newReqs = requirements;
    for (const [br, bc] of bodyTiles(lr, lc)) {
      const tile = targetGrid[br][bc];
      const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
      if (!entry.canEnter) { canLand = false; break; }
      if (entry.newReqs !== newReqs) {
        newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
        for (const req of entry.newReqs) newReqs.add(req);
      }
    }
    if (canLand) {
      const existingReqs = bodyReached[otherLayer][lr][lc];
      if (existingReqs === null || existingReqs.size > newReqs.size) {
        bodyReached[otherLayer][lr][lc] = newReqs;
        if (newReqs === requirements) {
          deque.unshift({ row: lr, col: lc, layer: otherLayer, requirements: newReqs });
        } else {
          deque.push({ row: lr, col: lc, layer: otherLayer, requirements: newReqs });
        }
        // Record stair tiles for arrow rendering (marked in reached after BFS)
        for (const [sr, sc] of stairTiles) {
          traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
        }
      }
      break;
    }
    // Not passable here — keep scanning (void corridor between stair and floor)
  }
};

export { processLedgeFall, processStairTraversal };
export type { DualLayerFloodCell, BodyReached, TraversedStair, StepBounds };
