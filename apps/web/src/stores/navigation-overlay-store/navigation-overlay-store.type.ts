/* @layer renderer-stores @kind types */
import type { FloodFillResult, ConnectionInfo, ScreenBundle, ScreenCrossings } from '@shared/game/navigation';
import type { ScreenAnnotations } from '@shared/game/simulation';

interface PathTile { row: number; col: number; attr: number; }
interface FallHoleSpawn { gridRow: number; gridCol: number; entranceId: number; }
type NavMode = 'manual' | 'auto';

interface NavigationOverlayState {
  visible: boolean;
  mode: NavMode;
  screenBundle: ScreenBundle | null;
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
  setScreenBundle: (bundle: ScreenBundle | null) => void;
  setData: (result: FloodFillResult, connections: ConnectionInfo[], results?: FloodFillResult[], fallHoleSpawns?: FallHoleSpawn[], respawnEntIds?: Set<number>) => void;
  setAnnotations: (annotations: ScreenAnnotations[]) => void;
  setCrossings: (crossings: ScreenCrossings[]) => void;
  toggleKind: (kind: string) => void;
  setLockedTarget: (tile: { row: number; col: number } | null) => void;
  setLockedPath: (path: PathTile[] | null) => void;
  clear: () => void;
}

export type { FallHoleSpawn, NavigationOverlayState, NavMode, PathTile };
