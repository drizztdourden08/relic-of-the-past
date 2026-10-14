/* @layer renderer-stores @kind types */
import type { FloodFillResult, ConnectionInfo, ScreenCrossings } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { ScreenAnnotations } from '@rotp/navigation';

interface PathTile { row: number; col: number; attr: number; }
interface FallHoleSpawn { gridRow: number; gridCol: number; entranceId: number; }
type NavMode = 'manual' | 'auto';
type SetDataArgs = [
  result: FloodFillResult,
  connections: ConnectionInfo[],
  results?: FloodFillResult[],
  fallHoleSpawns?: FallHoleSpawn[],
  respawnEntIds?: Set<number>,
];

interface NavigationOverlayState {
  visible: boolean;
  mode: NavMode;
  screenBundle: ScreenBundleGrid | null;
  result: FloodFillResult | null;
  results: FloodFillResult[];
  connections: ConnectionInfo[];
  fallHoleSpawns: FallHoleSpawn[];
  respawnEntIds: Set<number>;
  crossings: ScreenCrossings[];
  annotations: ScreenAnnotations[];
  hiddenKinds: ReadonlySet<string>;
  lockedTarget: { row: number; col: number } | null;
  lockedPath: PathTile[] | null;
  setVisible: (visible: boolean) => void;
  setMode: (mode: NavMode) => void;
  setScreenBundle: (bundle: ScreenBundleGrid | null) => void;
  setData: (...args: SetDataArgs) => void;
  setAnnotations: (annotations: ScreenAnnotations[]) => void;
  setCrossings: (crossings: ScreenCrossings[]) => void;
  toggleKind: (kind: string) => void;
  setLockedTarget: (tile: { row: number; col: number } | null) => void;
  setLockedPath: (path: PathTile[] | null) => void;
  clear: () => void;
}

export type { FallHoleSpawn, NavigationOverlayState, NavMode, PathTile, SetDataArgs };
