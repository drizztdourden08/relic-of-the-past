/* @layer renderer-widgets @kind types */
import type { ConnectionInfo, FloodFillResult } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';

interface MinimapProps {
  bundle: ScreenBundleGrid;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  playerScreenIndex: number | null;
  playerPos: { screen: number; row: number; col: number } | null;
  roomIndex: number;
}

export type { MinimapProps };
