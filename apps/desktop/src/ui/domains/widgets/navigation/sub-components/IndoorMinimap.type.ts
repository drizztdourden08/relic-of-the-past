/* @layer renderer-widgets @kind types */
import type { ConnectionInfo, ScreenBundleGrid, FloodFillResult } from '@shared/game/navigation';

interface MinimapProps {
  bundle: ScreenBundleGrid;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  playerScreenIndex: number | null;
  playerPos: { screen: number; row: number; col: number } | null;
  roomIndex: number;
}

export type { MinimapProps };
