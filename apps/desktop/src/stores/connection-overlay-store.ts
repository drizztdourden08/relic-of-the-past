import { create } from 'zustand';
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

interface ConnectionOverlayState {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Current flood fill result to render */
  result: FloodFillResult | null;
  /** Detected connections */
  connections: ConnectionInfo[];
  /** Toggle overlay visibility */
  setVisible: (visible: boolean) => void;
  /** Update with new flood fill data */
  setData: (result: FloodFillResult, connections: ConnectionInfo[]) => void;
  /** Clear all data */
  clear: () => void;
}

export const useConnectionOverlayStore = create<ConnectionOverlayState>((set) => ({
  visible: false,
  result: null,
  connections: [],
  setVisible: (visible) => set({ visible }),
  setData: (result, connections) => set({ result, connections, visible: true }),
  clear: () => set({ result: null, connections: [], visible: false }),
}));
