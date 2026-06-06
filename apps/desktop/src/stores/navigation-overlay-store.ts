import { create } from 'zustand';
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

interface PathTile { row: number; col: number; attr: number; }
interface FallHoleSpawn { gridRow: number; gridCol: number; entranceId: number; }

interface NavigationOverlayState {
  /** Whether the overlay is visible */
  visible: boolean;
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
  /** Locked target tile from overlay path debug */
  lockedTarget: { row: number; col: number } | null;
  /** Last computed A* path (with tile attrs) when target is locked */
  lockedPath: PathTile[] | null;
  /** Toggle overlay visibility */
  setVisible: (visible: boolean) => void;
  /** Update with new flood fill data */
  setData: (result: FloodFillResult, connections: ConnectionInfo[], results?: FloodFillResult[], fallHoleSpawns?: FallHoleSpawn[], respawnEntIds?: Set<number>) => void;
  /** Set locked target */
  setLockedTarget: (tile: { row: number; col: number } | null) => void;
  /** Set locked path */
  setLockedPath: (path: PathTile[] | null) => void;
  /** Clear all data */
  clear: () => void;
}

const useNavigationOverlayStore = create<NavigationOverlayState>((set) => ({
  visible: false,
  result: null,
  results: [],
  connections: [],
  fallHoleSpawns: [],
  respawnEntIds: new Set(),
  lockedTarget: null,
  lockedPath: null,
  setVisible: (visible) => set({ visible }),
  setData: (result, connections, results, fallHoleSpawns, respawnEntIds) => set({ result, connections, results: results ?? [result], fallHoleSpawns: fallHoleSpawns ?? [], respawnEntIds: respawnEntIds ?? new Set(), visible: true }),
  setLockedTarget: (tile) => set({ lockedTarget: tile }),
  setLockedPath: (path) => set({ lockedPath: path }),
  clear: () => set({ result: null, results: [], connections: [], fallHoleSpawns: [], visible: false, lockedTarget: null, lockedPath: null }),
}));

/** @deprecated Use useNavigationOverlayStore instead */
const useConnectionOverlayStore = useNavigationOverlayStore;

export { useNavigationOverlayStore, useConnectionOverlayStore };
export type { FallHoleSpawn };
