/* @layer shared-game @kind logic */
import type { FloodFillResult } from '../../types';
import type { BorderDir, WalkConnection } from './border-bundles.type';
import { computeOverlap } from './compute-overlap';
import { findBorderBundles } from './find-border-bundles';
import { OPPOSITE_DIR } from './border-bundles.constants';

const buildWalkConnection = (fromResult: FloodFillResult, toResult: FloodFillResult, direction: BorderDir): WalkConnection[] => {
  const fromBundles = findBorderBundles(fromResult).filter(b => b.direction === direction);
  const toBundles = findBorderBundles(toResult).filter(b => b.direction === OPPOSITE_DIR[direction]);

  const connections: WalkConnection[] = [];
  for (const fb of fromBundles) {
    for (const tb of toBundles) {
      const overlap = computeOverlap(fb.tiles, tb.tiles);
      if (overlap.length > 0) connections.push({ fromBundle: fb, toBundle: tb, overlapTiles: overlap });
    }
  }
  return connections;
};

export { buildWalkConnection };
