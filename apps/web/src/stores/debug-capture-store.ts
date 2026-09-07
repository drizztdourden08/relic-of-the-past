/* @layer renderer-stores @kind logic */
/**
 * The debug-capture ring buffer: while running, samples exactly where Link and the game are
 * (the same map slice the Navigation widget reads) plus a screenshot, once a second, so a
 * debug report can attach a timeline instead of one instant. Self-stops once the accumulated
 * data would exceed a fixed byte budget, so a long session never grows the eventual .zip out
 * of proportion. Toggled by the titlebar button and the rebindable function action
 * (input-manager-debug-capture.ts), both gated on GameSettings.allowDebugLogging by their
 * own callers.
 *
 * Multiple start/stop cycles ACCUMULATE into the same buffer (each tagged with its own
 * `session` number) instead of the later one replacing the earlier one, so a player who
 * records a bug, stops, repositions, and records again ends up with both recordings in the
 * eventual report. Only drain() (sending the report) clears the buffer.
 */
import { create } from 'zustand';
import type { DebugCaptureSnapshot, DebugCaptureScreenshot } from '@shared/types/debug-report';
import { useGameUIStore } from './game-ui-store';
import { captureGameFrameBlob } from '@app/lib/game/capture-frame';

const SAMPLE_INTERVAL_MS = 1000;
const CAPTURE_BUDGET_BYTES = 2 * 1024 * 1024;
const MAX_SNAPSHOTS = 2000;

interface DebugCaptureDrain {
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
}

interface DebugCaptureStore {
  isCapturing: boolean;
  startedAt: number | null;
  session: number;
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
  estimatedBytes: number;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  drain: () => DebugCaptureDrain;
}

const takeSnapshot = (session: number): DebugCaptureSnapshot => {
  const map = useGameUIStore.getState().map;
  return {
    session,
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

let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;

const scheduleTick = (gen: number): void => {
  timer = setTimeout(() => { void tick(gen); }, SAMPLE_INTERVAL_MS);
};

const tick = async (gen: number): Promise<void> => {
  if (gen !== generation) return;
  const state = useDebugCaptureStore.getState();
  const snapshot = takeSnapshot(state.session);
  const blob = await captureGameFrameBlob();
  if (gen !== generation) return;

  const snapshotBytes = JSON.stringify(snapshot).length;
  const shotBytes = blob?.size ?? 0;
  if (state.estimatedBytes + snapshotBytes + shotBytes > CAPTURE_BUDGET_BYTES) {
    state.stop();
    return;
  }

  const screenshots = blob
    ? [...state.screenshots, { session: state.session, capturedAt: snapshot.capturedAt, png: await blob.arrayBuffer() }]
    : state.screenshots;
  useDebugCaptureStore.setState({
    snapshots: [...state.snapshots, snapshot].slice(-MAX_SNAPSHOTS),
    screenshots,
    estimatedBytes: state.estimatedBytes + snapshotBytes + shotBytes,
  });
  scheduleTick(gen);
};

const useDebugCaptureStore = create<DebugCaptureStore>((set, get) => ({
  isCapturing: false,
  startedAt: null,
  session: 0,
  snapshots: [],
  screenshots: [],
  estimatedBytes: 0,
  start: () => {
    if (get().isCapturing) return;
    generation += 1;
    set((s) => ({ isCapturing: true, startedAt: Date.now(), session: s.session + 1 }));
    scheduleTick(generation);
  },
  stop: () => {
    generation += 1;
    if (timer) { clearTimeout(timer); timer = null; }
    set({ isCapturing: false });
  },
  toggle: () => { (get().isCapturing ? get().stop : get().start)(); },
  drain: () => {
    const { snapshots, screenshots } = get();
    set({ snapshots: [], screenshots: [], estimatedBytes: 0, session: 0 });
    return { snapshots, screenshots };
  },
}));

export { useDebugCaptureStore };
