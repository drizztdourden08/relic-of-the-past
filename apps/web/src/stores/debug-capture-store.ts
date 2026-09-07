/* @layer renderer-stores @kind logic */
/**
 * The debug-capture ring buffer: while running, samples exactly where Link and the game
 * are (the same map slice the Navigation widget reads) on an interval, so a debug report
 * can attach a timeline instead of one instant. Capped so a long session never grows the
 * eventual .zip out of proportion. Toggled by the titlebar button / Tab shortcut, both
 * gated on GameSettings.allowDebugLogging by their own callers.
 */
import { create } from 'zustand';
import type { DebugCaptureSnapshot } from '@shared/types/debug-report';
import { useGameUIStore } from './game-ui-store';

const SAMPLE_INTERVAL_MS = 1000;
const MAX_SNAPSHOTS = 2000;

interface DebugCaptureStore {
  isCapturing: boolean;
  snapshots: DebugCaptureSnapshot[];
  start: () => void;
  stop: () => void;
  toggle: () => void;
  /** Returns and clears the buffer, for packaging into a report. */
  drain: () => DebugCaptureSnapshot[];
}

const takeSnapshot = (): DebugCaptureSnapshot => {
  const map = useGameUIStore.getState().map;
  return {
    capturedAt: Date.now(),
    screenId: map.isIndoors ? `room-0x${map.roomIndex.toString(16)}` : `ow-0x${map.overworldScreenIndex.toString(16)}`,
    isIndoors: map.isIndoors,
    roomIndex: map.roomIndex,
    isDarkWorld: map.isDarkWorld,
    overworldScreenIndex: map.overworldScreenIndex,
    palaceIndex: map.palaceIndex,
    whichEntrance: map.whichEntrance,
    playerX: map.linkX,
    playerY: map.linkY,
  };
};

let timer: ReturnType<typeof setInterval> | null = null;

const useDebugCaptureStore = create<DebugCaptureStore>((set, get) => ({
  isCapturing: false,
  snapshots: [],
  start: () => {
    if (timer) return;
    set({ isCapturing: true, snapshots: [takeSnapshot()] });
    timer = setInterval(() => {
      set((s) => ({ snapshots: [...s.snapshots, takeSnapshot()].slice(-MAX_SNAPSHOTS) }));
    }, SAMPLE_INTERVAL_MS);
  },
  stop: () => {
    if (timer) { clearInterval(timer); timer = null; }
    set({ isCapturing: false });
  },
  toggle: () => { (get().isCapturing ? get().stop : get().start)(); },
  drain: () => {
    const snapshots = get().snapshots;
    set({ snapshots: [] });
    return snapshots;
  },
}));

export { useDebugCaptureStore };
