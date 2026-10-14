/* @layer renderer-appshell @kind logic */
import type { FloodFillDumpInput } from './dump-nav.type';
import { HORIZONTAL_BOUNDARY_SHAPES, VERTICAL_BOUNDARY_SHAPES } from './nav-dump.constants';
import { crossingTiles } from './crossing-tiles';

const hasBoundary = (shape: string, shapes: readonly string[], fullsize: number): boolean => shapes.includes(shape) && fullsize === 0;

const scrollBoundary = (roomLayout: FloodFillDumpInput['roomLayout'], reachable: number[][]) => {
  const shape = roomLayout?.shape ?? '1x1';
  const quadrantFullsizeX = roomLayout?.quadrantFullsizeX ?? 0;
  const quadrantFullsizeY = roomLayout?.quadrantFullsizeY ?? 0;
  const hasHorizontalBoundary = hasBoundary(shape, HORIZONTAL_BOUNDARY_SHAPES, quadrantFullsizeY);
  const hasVerticalBoundary = hasBoundary(shape, VERTICAL_BOUNDARY_SHAPES, quadrantFullsizeX);

  return {
    shape,
    quadrantFullsizeX,
    quadrantFullsizeY,
    hasHorizontalBoundary,
    hasVerticalBoundary,
    crossingTiles: [
      ...(hasHorizontalBoundary ? crossingTiles(reachable, 'horizontal') : []),
      ...(hasVerticalBoundary ? crossingTiles(reachable, 'vertical') : []),
    ],
  };
};

export { scrollBoundary };
