/* @layer shared-game @kind logic */
import type { GridPos, TilePassability } from '@rotp/game-core';
import type { LayerStrategy, BFSCell, BFSExpansionResult, EntryContext, QuadrantBounds } from './layer-strategy';
import type { DualLayerTileResult, TraversedStairTile, TraversedTile } from './dual-layer-build-result.type';
import { GRID_SIZE } from '../types/grid.constants';
import { isDoorPassageAttr } from '../tile-attrs';
import { cellAt } from '../../checked-access';
import { bodyTiles } from './body-tiles';
import { bodyOutOfBounds } from './body-out-of-bounds';
import { getNewTiles } from './new-tiles';
import { canLeaveLedge } from './can-leave-ledge';
import { enterTiles } from './enter-tiles';
import { buildDualLayerTileResult } from './dual-layer-build-result';
import { createCrossingRecorder } from './ledge-crossings';
import { swapStairAt } from './swap-stair-at';
import { MAX_LAND_ATTEMPTS } from './dual-layer.constants';

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
    const next: GridPos = { row: row + dr, col: col + dc };
    if (bodyOutOfBounds(next.row, next.col, bounds)) return [];

    const entry: EntryContext = { dr, dc, requirements, inventory };
    const newTiles = getNewTiles(next.row, next.col, dr, dc);
    if (layer === 0 && newTiles.some(([tr, tc]) => this.isUpperLedge(tr, tc))) {
      return this.canLeaveAll(newTiles, entry) ? this.expandLedgeCross(next, entry, bounds) : [];
    }
    if (newTiles.some(([tr, tc]) => swapStairAt(this.rawAttrs, tr, tc))) {
      return dc === 0 ? this.expandStairCross(next, layer, entry, bounds) : [];
    }
    return this.expandFlat(next, layer, newTiles, entry);
  }

  private isUpperLedge(r: number, c: number): boolean {
    return cellAt(this.grids[0], r, c).type === 'ledge';
  }

  private canLeaveAll(tiles: [number, number][], entry: EntryContext): boolean {
    return tiles.every(([tr, tc]) => {
      const t = cellAt(this.grids[0], tr, tc);
      return t.type === 'ledge' && canLeaveLedge(t.dir, entry.dr, entry.dc);
    });
  }

  private expandFlat(next: GridPos, layer: 0 | 1, newTiles: [number, number][], entry: EntryContext): BFSExpansionResult[] {
    const results: BFSExpansionResult[] = [];
    const moved = enterTiles(newTiles, this.grids[layer], entry);
    if (moved) results.push({ ...next, layer, requirements: moved });

    const other = layer === 0 ? 1 : 0;
    if (!moved && newTiles.every(([tr, tc]) => isDoorPassageAttr(this.rawAttrs[other][tr]?.[tc] ?? 0))) {
      results.push({ ...next, layer: other, requirements: entry.requirements });
    }
    return results;
  }

  private expandLedgeCross(from: GridPos, entry: EntryContext, bounds: QuadrantBounds): BFSExpansionResult[] {
    const { dr, dc, requirements } = entry;
    const ledgeTiles: [number, number][] = [];
    let landAttempts = 0;

    for (let step = 0; step < GRID_SIZE; step++) {
      const land: GridPos = { row: from.row + step * dr, col: from.col + step * dc };
      if (bodyOutOfBounds(land.row, land.col, bounds)) break;

      const onCliff = bodyTiles(land.row, land.col).filter(([br, bc]) => this.isUpperLedge(br, bc));
      if (onCliff.length > 0) {
        ledgeTiles.push(...onCliff);
        continue;
      }

      if (++landAttempts > MAX_LAND_ATTEMPTS) return [];

      const landed = enterTiles(bodyTiles(land.row, land.col), this.grids[1], entry);
      if (landed) {
        for (const [lr, lc] of ledgeTiles) this.traversedLedgeTiles.push({ row: lr, col: lc, reqs: requirements });
        this.crossings.add(from, land, dr);
        return [{ ...land, layer: 1, requirements: landed }];
      }
    }
    return [];
  }

  private expandStairCross(from: GridPos, layer: 0 | 1, entry: EntryContext, bounds: QuadrantBounds): BFSExpansionResult[] {
    const { dr, requirements } = entry;
    const otherLayer = layer === 0 ? 1 : 0;
    const nc = from.col;
    const stairTiles: [number, number][] = [];
    let landAttempts = 0;

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = from.row + step * dr;
      if (bodyOutOfBounds(lr, nc, bounds)) break;

      const onStair = bodyTiles(lr, nc).filter(([br, bc]) => swapStairAt(this.rawAttrs, br, bc));
      if (onStair.length > 0) {
        stairTiles.push(...onStair);
        continue;
      }

      if (++landAttempts > MAX_LAND_ATTEMPTS) return [];

      const landed = enterTiles(bodyTiles(lr, nc), this.grids[otherLayer], { ...entry, dc: 0 });
      if (landed) {
        for (const [sr, sc] of stairTiles) this.traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
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
