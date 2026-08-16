/* @layer renderer-stores @kind logic */
/**
 * Everything a flood produces lives here, not in the widget.
 *
 * The navigation widget is `game-only`, so opening the hub unmounts it and takes any
 * component state with it. That is how the minimap used to vanish while the overlay
 * survived: the two halves of one result were stored in two places. A flood result outlives
 * the panel that asked for it, so this store owns all of it and the widget only reads.
 */
import { create } from 'zustand';
import type { FloodFillResult, ConnectionInfo, ScreenBundle, ScreenCrossings } from '@shared/game/navigation';
import type { ScreenAnnotations } from '@shared/game/simulation';

interface PathTile { row: number; col: number; attr: number; }
interface FallHoleSpawn { gridRow: number; gridCol: number; entranceId: number; }
/** Manual = flood on demand; auto = re-flood on room, quadrant and inventory changes. */
type NavMode = 'manual' | 'auto';

interface NavigationOverlayState {
  /** Whether the overlay is visible */
  visible: boolean;
  /** How floods are triggered. Persisted here so it survives the widget unmounting. */
  mode: NavMode;
  /** The screen/room group the minimap draws, kept alongside the results it describes. */
  screenBundle: ScreenBundle | null;
  /** Current flood fill result to render */
  result: FloodFillResult | null;
  /** Multi-screen flood fill results for visible loaded screens */
  results: FloodFillResult[];
  /** Detected connections */
  connections: ConnectionInfo[];
  /** Fall hole landing positions for current room */
  fallHoleSpawns: FallHoleSpawn[];
  /** Entrance IDs classified as respawn points (not physical doors) */
  respawnEntIds: Set<number>;
  /**
   * Every way on or off each flooded screen, from the crossings facade. One
   * entry per screen, in the order the flood reached them.
   */
  crossings: ScreenCrossings[];
  /**
   * What the simulator knows about the flooded screen — chests, locks, triggers,
   * exits and their state. Fed separately from the flood so the overlay, the
   * minimap and the widget panel all read one description.
   */
  /** One entry per flooded screen — a multi-screen area annotates all of them. */
  annotations: ScreenAnnotations[];
  /** Annotation kinds the viewer has switched off in the legend. */
  hiddenKinds: ReadonlySet<string>;
  /** Locked target tile from overlay path debug */
  lockedTarget: { row: number; col: number } | null;
  /** Last computed A* path (with tile attrs) when target is locked */
  lockedPath: PathTile[] | null;
  /** Toggle overlay visibility */
  setVisible: (visible: boolean) => void;
  setMode: (mode: NavMode) => void;
  /** Replace the minimap's screen group (null drops a stale one). */
  setScreenBundle: (bundle: ScreenBundle | null) => void;
  /** Update with new flood fill data */
  setData: (result: FloodFillResult, connections: ConnectionInfo[], results?: FloodFillResult[], fallHoleSpawns?: FallHoleSpawn[], respawnEntIds?: Set<number>) => void;
  /** Replace the annotation set for the flooded screen */
  setAnnotations: (annotations: ScreenAnnotations[]) => void;
  /** Replace the crossing records for the flooded screens */
  setCrossings: (crossings: ScreenCrossings[]) => void;
  toggleKind: (kind: string) => void;
  /** Set locked target */
  setLockedTarget: (tile: { row: number; col: number } | null) => void;
  /** Set locked path */
  setLockedPath: (path: PathTile[] | null) => void;
  /** Drop every flood product: overlay, minimap group and annotations. */
  clear: () => void;
}

const useNavigationOverlayStore = create<NavigationOverlayState>((set) => ({
  visible: false,
  mode: 'manual',
  screenBundle: null,
  result: null,
  results: [],
  connections: [],
  fallHoleSpawns: [],
  respawnEntIds: new Set(),
  crossings: [],
  annotations: [],
  hiddenKinds: new Set<string>(),
  lockedTarget: null,
  lockedPath: null,
  setVisible: (visible) => set({ visible }),
  setMode: (mode) => set({ mode }),
  setScreenBundle: (screenBundle) => set({ screenBundle }),
  setData: (result, connections, results, fallHoleSpawns, respawnEntIds) => set({ result, connections, results: results ?? [result], fallHoleSpawns: fallHoleSpawns ?? [], respawnEntIds: respawnEntIds ?? new Set(), visible: true }),
  setAnnotations: (annotations) => set({ annotations }),
  setCrossings: (crossings) => set({ crossings }),
  toggleKind: (kind) => set((s) => {
    const next = new Set(s.hiddenKinds);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    return { hiddenKinds: next };
  }),
  setLockedTarget: (tile) => set({ lockedTarget: tile }),
  setLockedPath: (path) => set({ lockedPath: path }),
  // Deliberately leaves `mode` alone: clearing is about the data, not how the next flood
  // gets triggered.
  clear: () => set({ result: null, results: [], connections: [], fallHoleSpawns: [], respawnEntIds: new Set(), crossings: [], annotations: [], screenBundle: null, visible: false, lockedTarget: null, lockedPath: null }),
}));

export { useNavigationOverlayStore };
export type { FallHoleSpawn, NavMode };
