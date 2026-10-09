/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import type { LayerStrategy, BFSCell, BFSExpansionResult, QuadrantBounds } from './layer-strategy';
import type { DualLayerTileResult, TraversedStairTile, TraversedTile } from './dual-layer-build-result.type';
import { GRID_SIZE } from '../types/grid.constants';
import { isDoorPassageAttr } from '../tile-attrs';
import { bodyTiles } from './body-tiles';
import { getNewTiles } from './new-tiles';
import { canLeaveLedge } from './can-leave-ledge';
import { enterTiles } from './enter-tiles';
import { buildDualLayerTileResult } from './dual-layer-build-result';
import { createCrossingRecorder } from './ledge-crossings';
import { MAX_LAND_ATTEMPTS, SWAP_STAIR_ATTRS } from './dual-layer.constants';

const outOfBounds = (r: number, c: number, bounds: QuadrantBounds): boolean =>
  r < bounds.minRow || r + 1 > bounds.maxRow || c < bounds.minCol || c + 1 > bounds.maxCol;

class DualLayerStrategy implements LayerStrategy {
  readonly layerCount = 2 as const;
  private readonly grids: [TilePassability[][], TilePassability[][]];
  private readonly rawAttrs: [number[][], number[][]];
  private readonly tileContext: boolean;
  private readonly startLayer: 0 | 1;
  private readonly traversedStairTiles: TraversedStairTile[] = [];
  private readonly traversedLedgeTiles: TraversedTile[] = [];
  private readonly crossings = createCrossingRecorder();

  constructor(
    grids: [TilePassability[][], TilePassability[][]],
    rawAttrs: [number[][], number[][]],
    tileContext: boolean,
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

    if (outOfBounds(nr, nc, bounds)) return [];

    const newTiles = getNewTiles(nr, nc, dr, dc);

    const ledge = layer === 0 ? newTiles.map(([tr, tc]) => this.grids[0][tr][tc]).find((t) => t.type === 'ledge') : undefined;
    if (ledge?.type === 'ledge') {
      if (!canLeaveLedge(ledge.dir, dr, dc)) return [];
      for (const [tr, tc] of newTiles) {
        const t = this.grids[0][tr][tc];
        if (t.type !== 'ledge' || !canLeaveLedge(t.dir, dr, dc)) return [];
      }
      return this.expandLedgeCross(nr, nc, dr, dc, requirements, inventory, bounds);
    }

    if (newTiles.some(([tr, tc]) => this.isSwapStair(tr, tc))) {
      if (dc !== 0) return [];
      return this.expandStairCross(nr, nc, dr, layer, requirements, inventory, bounds);
    }

    const results: BFSExpansionResult[] = [];
    const moved = enterTiles(newTiles, this.grids[layer], dr, dc, requirements, inventory);
    if (moved) results.push({ row: nr, col: nc, layer, requirements: moved });

    const other = (1 - layer) as 0 | 1;
    if (!moved && newTiles.every(([tr, tc]) => isDoorPassageAttr(this.rawAttrs[other][tr]?.[tc] ?? 0))) {
      results.push({ row: nr, col: nc, layer: other, requirements });
    }
    return results;
  }

  private isSwapStair(r: number, c: number): boolean {
    return SWAP_STAIR_ATTRS.has(this.rawAttrs[0][r]?.[c]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][r]?.[c]);
  }

  private expandLedgeCross(
    nr: number, nc: number, dr: number, dc: number,
    requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const ledgeTiles: [number, number][] = [];
    let landAttempts = 0;

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      const lc = nc + step * dc;
      if (outOfBounds(lr, lc, bounds)) break;

      const onCliff = bodyTiles(lr, lc).filter(([br, bc]) => this.grids[0][br][bc].type === 'ledge');
      if (onCliff.length > 0) {
        ledgeTiles.push(...onCliff);
        continue;
      }

      if (++landAttempts > MAX_LAND_ATTEMPTS) return [];

      const landed = enterTiles(bodyTiles(lr, lc), this.grids[1], dr, dc, requirements, inventory);
      if (landed) {
        for (const [lr2, lc2] of ledgeTiles) {
          this.traversedLedgeTiles.push({ row: lr2, col: lc2, reqs: requirements });
        }
        this.crossings.add(nr, nc, lr, lc, dr);
        return [{ row: lr, col: lc, layer: 1, requirements: landed }];
      }
    }
    return [];
  }

  private expandStairCross(
    nr: number, nc: number, dr: number,
    layer: 0 | 1, requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const otherLayer = (1 - layer) as 0 | 1;
    const stairTiles: [number, number][] = [];
    let landAttempts = 0;

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      if (outOfBounds(lr, nc, bounds)) break;

      const onStair = bodyTiles(lr, nc).filter(([br, bc]) => this.isSwapStair(br, bc));
      if (onStair.length > 0) {
        stairTiles.push(...onStair);
        continue;
      }

      if (++landAttempts > MAX_LAND_ATTEMPTS) return [];

      const landed = enterTiles(bodyTiles(lr, nc), this.grids[otherLayer], dr, 0, requirements, inventory);
      if (landed) {
        for (const [sr, sc] of stairTiles) {
          this.traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
        }
        return [{ row: lr, col: nc, layer: otherLayer, requirements: landed }];
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
      ledgeCrossings: this.crossings.list(),
    });
  }
}

export { DualLayerStrategy };
