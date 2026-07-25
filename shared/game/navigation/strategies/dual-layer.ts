/* @layer shared-game @kind logic */
import type { TilePassability } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import type { LayerStrategy, BFSCell, BFSExpansionResult, QuadrantBounds } from './layer-strategy';
import { bodyTiles, getNewTiles, canLeaveLedge, evaluateEntry } from './bfs-helpers';
import { buildDualLayerTileResult, SWAP_STAIR_ATTRS } from './dual-layer-build-result';
import type { DualLayerTileResult } from './dual-layer-build-result';

/**
 * Dual-layer BFS strategy for indoor rooms with layer-swap stairs and ledge transitions.
 * Tracks reachability on both layers and handles cross-layer movement via stairs and ledges.
 */
class DualLayerStrategy implements LayerStrategy {
  readonly layerCount = 2 as const;
  private readonly grids: [TilePassability[][], TilePassability[][]];
  private readonly rawAttrs: [number[][], number[][]];
  private readonly tileContext: TileAttrContext;
  private readonly startLayer: 0 | 1;
  private readonly traversedStairTiles: { layer: 0 | 1; row: number; col: number; reqs: Set<string> }[] = [];
  private readonly traversedLedgeTiles: { row: number; col: number; reqs: Set<string> }[] = [];

  constructor(
    grids: [TilePassability[][], TilePassability[][]],
    rawAttrs: [number[][], number[][]],
    tileContext: TileAttrContext,
    startLayer: 0 | 1,
  ) {
    this.grids = grids;
    this.rawAttrs = rawAttrs;
    this.tileContext = tileContext;
    this.startLayer = startLayer;
  }

  getGrid(layer: 0 | 1): TilePassability[][] { return this.grids[layer]; }
  getRawAttr(layer: 0 | 1): number[][] { return this.rawAttrs[layer]; }
  findStartLayer(): 0 | 1 { return this.startLayer; }

  expand(
    cell: BFSCell,
    dr: number,
    dc: number,
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const { row, col, layer, requirements } = cell;
    const nr = row + dr;
    const nc = col + dc;

    if (nr < bounds.minRow || nr + 1 > bounds.maxRow || nc < bounds.minCol || nc + 1 > bounds.maxCol) return [];

    const newTiles = getNewTiles(nr, nc, dr, dc);

    // ─── Ledge detection: new tiles on layer 0 hitting a ledge ───
    let hitLedge = false;
    let ledgeFallMatch = false;
    if (layer === 0) {
      for (const [tr, tc] of newTiles) {
        const t = this.grids[0][tr][tc];
        if (t.type === 'ledge') {
          hitLedge = true;
          if (canLeaveLedge(t.dir, dr, dc)) ledgeFallMatch = true;
          break;
        }
      }
    }

    if (hitLedge && !ledgeFallMatch) return [];

    if (hitLedge && ledgeFallMatch) {
      // Link's 2-wide leading edge must sit fully on jump tiles pointing the same way —
      // a 1-wide ledge can't carry his 2x2 body. Checking the whole body at the entry
      // position is wrong: it straddles the trigger line AND the approach floor, which
      // only coincides with ledge tiles when the band happens to be 2+ deep (south fans).
      // 1-deep north/east/west trigger lines must still fire the cross.
      for (const [tr, tc] of newTiles) {
        const t = this.grids[0][tr][tc];
        if (t.type !== 'ledge' || !canLeaveLedge(t.dir, dr, dc)) return [];
      }

      return this.expandLedgeCross(nr, nc, dr, dc, requirements, inventory, bounds);
    }

    // ─── Stair detection ───
    // Check BOTH layers' raw attrs (consistent with onStair check in expandStairCross).
    // If a tile is a swap-stair on either layer, it blocks normal same-layer expansion.
    let hitStair = false;
    for (const [tr, tc] of newTiles) {
      if (SWAP_STAIR_ATTRS.has(this.rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][tr]?.[tc])) {
        hitStair = true; break;
      }
    }

    if (hitStair) {
      if (dc !== 0) return []; // Side entry blocked
      return this.expandStairCross(nr, nc, dr, dc, layer, requirements, inventory, bounds);
    }

    // ─── Same-layer expansion ───
    const results: BFSExpansionResult[] = [];
    const targetGrid = this.grids[layer];
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
      results.push({ row: nr, col: nc, layer, requirements: newReqs });
    }

    // ─── Door-passage layer bridge ───
    // A door threshold (plain passages 0x80-0x8D, or layer-toggle shutters
    // 0x90-0xAF which flip Link's layer by design) belongs to its door's
    // layer, and the game's door transit puts Link ON that layer. Stepping
    // onto tiles that are door passages on the OTHER layer continues the walk
    // there — lower-layer doors (the sewers' BG1 corridors, the sanctuary's
    // back door) are unreachable from an upper-layer approach otherwise.
    const other = (1 - layer) as 0 | 1;
    const doorPassage = (a: number): boolean => (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);
    if (newTiles.every(([tr, tc]) => doorPassage(this.rawAttrs[other][tr]?.[tc] ?? 0))) {
      results.push({ row: nr, col: nc, layer: other, requirements });
    }
    return results;
  }

  private expandLedgeCross(
    nr: number, nc: number, dr: number, dc: number,
    requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const targetGrid = this.grids[1];
    const layer0Grid = this.grids[0];

    const ledgeTiles: [number, number][] = [];

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      const lc = nc + step * dc;
      if (lr < bounds.minRow || lr + 1 > bounds.maxRow || lc < bounds.minCol || lc + 1 > bounds.maxCol) break;

      let stillOnCliff = false;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        if (layer0Grid[br][bc].type === 'ledge') {
          stillOnCliff = true;
          ledgeTiles.push([br, bc]);
        }
      }
      if (stillOnCliff) continue;

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
        for (const [lr2, lc2] of ledgeTiles) {
          this.traversedLedgeTiles.push({ row: lr2, col: lc2, reqs: requirements });
        }
        // Enqueue the landing on layer 1 so the flood continues into the lower
        // area. Recording the traversed ledge tiles above only draws the overlay
        // arrow; without this return the dropped-to region never gets flooded.
        return [{ row: lr, col: lc, layer: 1, requirements: newReqs }];
      }
    }
    return [];
  }

  private expandStairCross(
    nr: number, nc: number, dr: number, _dc: number,
    layer: 0 | 1, requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const otherLayer = (1 - layer) as 0 | 1;
    const targetGrid = this.grids[otherLayer];
    const stairTiles: [number, number][] = [];
    let landAttempts = 0;

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      const lc = nc;
      if (lr < bounds.minRow || lr + 1 > bounds.maxRow || lc < bounds.minCol || lc + 1 > bounds.maxCol) break;

      let onStair = false;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        if (SWAP_STAIR_ATTRS.has(this.rawAttrs[0][br]?.[bc]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][br]?.[bc])) {
          onStair = true;
          stairTiles.push([br, bc]);
        }
      }
      if (onStair) continue;

      // Stairs deposit Link right at their end. If the body can't stand within
      // a few steps of the band (body alignment + landing decor), the cross
      // FAILS — an unbounded scan would teleport the flood across sealed
      // regions (0x71's locked corridor seam, ~17 rows away).
      if (++landAttempts > 4) return [];

      let canLand = true;
      let newReqs = requirements;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        const tile = targetGrid[br][bc];
        const entry = evaluateEntry(tile, dr, 0, requirements, inventory);
        if (!entry.canEnter) { canLand = false; break; }
        if (entry.newReqs !== newReqs) {
          newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
          for (const req of entry.newReqs) newReqs.add(req);
        }
      }
      if (canLand) {
        for (const [sr, sc] of stairTiles) {
          this.traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
        }
        return [{ row: lr, col: lc, layer: otherLayer, requirements: newReqs }];
      }
    }
    return [];
  }

  buildTileResult(
    bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]],
    bounds: QuadrantBounds,
  ): DualLayerTileResult {
    return buildDualLayerTileResult({
      bodyReached,
      bounds,
      grids: this.grids,
      rawAttrs: this.rawAttrs,
      tileContext: this.tileContext,
      traversedStairTiles: this.traversedStairTiles,
      traversedLedgeTiles: this.traversedLedgeTiles,
    });
  }
}

export { DualLayerStrategy };
