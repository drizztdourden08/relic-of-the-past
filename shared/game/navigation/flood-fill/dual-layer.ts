/* @layer shared-game @kind logic */
import type { TilePassability, TransitionPoint } from '../types';
import { GRID_SIZE } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { DIRECTIONS } from '../core';
import {
  findStartBody, bodyTiles, recordBorderTransition, canLeaveLedge, getNewTiles, evaluateEntry, SWAP_STAIR_ATTRS,
} from './bfs-helpers';
import type { QuadrantBounds } from './bfs-helpers';
import { processLedgeFall, processStairTraversal } from './dual-layer-steps';
import type { DualLayerFloodCell, BodyReached, TraversedStair } from './dual-layer-steps';
import { buildDualLayerResult } from './dual-layer-result';
import type { DualLayerResult } from './dual-layer-result';

const floodFillBFSDualLayer = (grids: [TilePassability[][], TilePassability[][]], rawAttrs: [number[][], number[][]], startRow: number, startCol: number, startLayer: 0 | 1, entrancePositions: { row: number; col: number; idx: number }[], inventory: Set<string>, tileContext: TileAttrContext, quadrantBounds?: QuadrantBounds): DualLayerResult => {
  const minR = quadrantBounds?.minRow ?? 0;
  const maxR = quadrantBounds?.maxRow ?? GRID_SIZE - 1;
  const minC = quadrantBounds?.minCol ?? 0;
  const maxC = quadrantBounds?.maxCol ?? GRID_SIZE - 1;

  // Body reached state: [layer][row][col]
  const bodyReached: BodyReached = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
  ];

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();
  // Stair tiles that were successfully traversed — marked after body→tile conversion
  const traversedStairTiles: TraversedStair[] = [];

  const deque: DualLayerFloodCell[] = [];

  // Find valid starting body position on the starting layer
  const startBody = findStartBody(startRow, startCol, grids[startLayer], inventory, minR, maxR, minC, maxC);
  if (startBody) {
    const startReqs = new Set<string>();
    for (const [r, c] of bodyTiles(startBody.row, startBody.col)) {
      const t = grids[startLayer][r][c];
      if (t.type === 'obstacle' && inventory.has(t.req!)) startReqs.add(t.req!);
      if (t.type === 'water' && inventory.has('flippers')) startReqs.add('flippers');
    }
    deque.push({ row: startBody.row, col: startBody.col, layer: startLayer, requirements: startReqs });
    bodyReached[startLayer][startBody.row][startBody.col] = startReqs;
  }

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, layer, requirements } = cell;

    const existing = bodyReached[layer][row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions
    for (const [r, c] of bodyTiles(row, col)) {
      recordBorderTransition(r, c, requirements, foundBorders, transitions, minR, maxR, minC, maxC);
    }

    // Record entrance reachability
    const bodyCenterRow = row + 1;
    const bodyCenterCol = col + 1;
    for (const ent of entrancePositions) {
      const key = `entrance-${ent.idx}`;
      if (foundBorders.has(key)) continue;
      const nearby =
        bodyCenterRow >= ent.row - 3 && bodyCenterRow <= ent.row + 5 &&
        bodyCenterCol >= ent.col - 3 && bodyCenterCol <= ent.col + 5;
      if (nearby) {
        foundBorders.add(key);
        transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
      }
    }

    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr < minR || nr + 1 > maxR || nc < minC || nc + 1 > maxC) continue;

      const newTiles = getNewTiles(nr, nc, dr, dc);

      // ─── Ledge detection: new tiles on layer 0 hitting a ledge ───
      // Ledge tiles are NEVER reachable on layer 0. They block entry and
      // trigger an immediate layer transition to layer 1 in the fall direction.
      let hitLedge = false;
      let ledgeFallMatch = false;
      if (layer === 0) {
        for (const [tr, tc] of newTiles) {
          const t = grids[0][tr][tc];
          if (t.type === 'ledge') {
            hitLedge = true;
            if (canLeaveLedge(t.dir, dr, dc)) {
              ledgeFallMatch = true;
            }
            break;
          }
        }
      }

      // Ledge from non-fall direction → blocked
      if (hitLedge && !ledgeFallMatch) continue;

      // Ledge in fall direction → cross-layer transition to layer 1.
      if (hitLedge && ledgeFallMatch) {
        processLedgeFall({ grids, requirements, inventory, nr, nc, dr, dc, minR, maxR, minC, maxC, deque, bodyReached });
        continue;
      }

      // ─── Stair detection: entering stair tiles triggers auto-traverse ───
      let hitStair = false;
      for (const [tr, tc] of newTiles) {
        if (SWAP_STAIR_ATTRS.has(rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][tr]?.[tc])) {
          hitStair = true; break;
        }
      }

      if (hitStair) {
        processStairTraversal({ layer, grids, rawAttrs, requirements, inventory, nr, nc, dr, dc, minR, maxR, minC, maxC, deque, bodyReached, traversedStairTiles });
        continue; // Stair blocks normal same-layer expansion in this direction
      }

      // ─── Same-layer expansion ───
      {
        const targetGrid = grids[layer];
        let canMove = true;
        let newReqs = requirements;
        for (const [tr, tc] of newTiles) {
          const tile = targetGrid[tr][tc];
          const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
          if (!entry.canEnter) { canMove = false; break; }
          if (entry.newReqs !== newReqs) {
            newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
            for (const req of entry.newReqs) newReqs.add(req);
          }
        }
        if (canMove) {
          const existingReqs = bodyReached[layer][nr][nc];
          if (existingReqs === null || existingReqs.size > newReqs.size) {
            bodyReached[layer][nr][nc] = newReqs;
            if (newReqs === requirements) {
              deque.unshift({ row: nr, col: nc, layer, requirements: newReqs });
            } else {
              deque.push({ row: nr, col: nc, layer, requirements: newReqs });
            }
          }
        }
      }
    }
  }

  return buildDualLayerResult({ bodyReached, traversedStairTiles, grids, rawAttrs, tileContext, transitions, minR, maxR, minC, maxC });
};

export { floodFillBFSDualLayer };
