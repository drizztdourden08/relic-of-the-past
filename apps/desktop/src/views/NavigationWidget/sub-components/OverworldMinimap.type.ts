/* @layer renderer-widgets @kind types */
import type { BorderEdge, ConnectionInfo, FloodFillResult } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { ScreenAnnotations } from '@rotp/navigation';

interface OverworldGrid {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  gridW: number;
  gridH: number;
  totalW: number;
  totalH: number;
}

interface CellOrigin {
  left: number;
  top: number;
}

interface OverworldPartProps {
  bundle: ScreenBundleGrid;
  grid: OverworldGrid;
}

interface CellBodyProps {
  bundle: ScreenBundleGrid;
  screen: number;
  size: number;
  result: FloodFillResult | undefined;
}

interface OverworldAnnotationsProps extends OverworldPartProps {
  annotations: ScreenAnnotations[];
}

interface OverworldEdgeBadgesProps extends OverworldPartProps {
  byEdge: Record<BorderEdge, ConnectionInfo[]>;
}

export type { CellBodyProps, CellOrigin, OverworldAnnotationsProps, OverworldEdgeBadgesProps, OverworldGrid };
