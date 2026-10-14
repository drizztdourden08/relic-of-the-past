/* @layer renderer-widgets @kind types */
import type { BorderEdge, ConnectionInfo, FloodFillResult } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';

interface MinimapProps {
  bundle: ScreenBundleGrid;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  playerScreenIndex: number | null;
  playerPos: { screen: number; row: number; col: number } | null;
  roomIndex: number;
}

interface BoundaryDot {
  x: number;
  y: number;
  color: string;
}

interface ScrollBoundaries {
  horizontal: boolean;
  vertical: boolean;
}

interface IndoorFrameBodyProps {
  result: FloodFillResult | undefined;
}

interface IndoorEdgeBadgesProps {
  byEdge: Record<BorderEdge, ConnectionInfo[]>;
}

export type { BoundaryDot, IndoorEdgeBadgesProps, IndoorFrameBodyProps, MinimapProps, ScrollBoundaries };
