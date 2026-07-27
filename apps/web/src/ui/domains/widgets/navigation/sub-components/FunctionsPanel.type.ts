/* @layer renderer-widgets @kind types */
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';
import type { NavMode } from '../../../../../stores/navigation-overlay-store';

interface FunctionsPanelProps {
  mode: NavMode;
  setMode: (mode: NavMode) => void;
  running: boolean;
  handleRun: () => void;
  handleClear: () => void;
  result: FloodFillResult | null;
  overworldScreenIndex: number;
  reachableSum: number;
  totalTilesSum: number;
  entranceSum: number;
  externalConnections: ConnectionInfo[];
  internalConnections: ConnectionInfo[];
}

export type { FunctionsPanelProps };
