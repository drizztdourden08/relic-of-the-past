import { create } from 'zustand';
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

interface ConnectionOverlayState {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Current flood fill result to render */
  result: FloodFillResult | null;
  /** Multi-screen flood fill results for visible loaded screens */
  results: FloodFillResult[];
  /** Detected connections */
  connections: ConnectionInfo[];
  /** Toggle overlay visibility */
  setVisible: (visible: boolean) => void;
  /** Update with new flood fill data */
  setData: (result: FloodFillResult, connections: ConnectionInfo[], results?: FloodFillResult[]) => void;
  /** Clear all data */
  clear: () => void;
}

export const useConnectionOverlayStore = create<ConnectionOverlayState>((set) => ({
  visible: false,
  result: null,
  results: [],
  connections: [],
  setVisible: (visible) => set({ visible }),
  setData: (result, connections, results) => set({ result, connections, results: results ?? [result], visible: true }),
  clear: () => set({ result: null, results: [], connections: [], visible: false }),
}));
