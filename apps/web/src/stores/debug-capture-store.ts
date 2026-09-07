/* @layer renderer-stores @kind logic */
/**
 * The debug-capture recorder: while running, samples exactly where Link and the game are
 * (the same map slice the Navigation widget reads) plus a screenshot, 4 times a second, so a
 * debug report can attach a timeline instead of one instant. A recording self-stops once it
 * would exceed a fixed byte budget, so a long session never grows out of proportion. Toggled
 * by the titlebar button and the rebindable function action (input-manager-debug-capture.ts),
 * both gated on GameSettings.allowDebugLogging by their own callers.
 *
 * Stopping - whether the user did it or the byte budget did - hands the just-finished session
 * straight to the main process (finalizeDebugCaptureSession), which writes the raw frames,
 * the position timeline, and an ffmpeg-encoded video (16fps, so 4x realtime) into their own
 * folder under profiles/<profileId>/debug-captures/ immediately, not deferred until a report
 * gets packaged. This store only ever holds ONE session's worth of data (the one currently
 * recording): nothing accumulates here across sessions, so recording repeatedly without ever
 * packaging a report can't grow memory without limit.
 */
import { create } from 'zustand';
import type { DebugCaptureSnapshot, DebugCaptureScreenshot } from '@shared/types/debug-report';
import { useGameUIStore } from './game-ui-store';
import { captureGameFrameBlob } from '@app/lib/game/capture-frame';

const SAMPLE_INTERVAL_MS = 250;
// Scales with the sample rate (4x the old 1/sec cadence) so a session still runs about as
// long in wall-clock time before self-stopping, not 4x shorter for capturing more often.
const CAPTURE_BUDGET_BYTES = 8 * 1024 * 1024;
const MAX_SNAPSHOTS = 2000;

interface DebugCaptureStore {
  isCapturing: boolean;
  startedAt: number | null;
  session: number;
  profileId: string | null;
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
  sessionBytes: number;
  start: (profileId: string) => void;
  stop: () => void;
  toggle: (profileId: string) => void;
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
  if (state.sessionBytes + snapshotBytes + shotBytes > CAPTURE_BUDGET_BYTES) {
    state.stop();
    return;
  }

  const screenshots = blob
    ? [...state.screenshots, { session: state.session, capturedAt: snapshot.capturedAt, png: await blob.arrayBuffer() }]
    : state.screenshots;
  useDebugCaptureStore.setState({
    snapshots: [...state.snapshots, snapshot].slice(-MAX_SNAPSHOTS),
    screenshots,
    sessionBytes: state.sessionBytes + snapshotBytes + shotBytes,
  });
  scheduleTick(gen);
};

const useDebugCaptureStore = create<DebugCaptureStore>((set, get) => ({
  isCapturing: false,
  startedAt: null,
  session: 0,
  profileId: null,
  snapshots: [],
  screenshots: [],
  sessionBytes: 0,
  start: (profileId: string) => {
    if (get().isCapturing) return;
    generation += 1;
    set((s) => ({
      isCapturing: true, startedAt: Date.now(), session: s.session + 1, profileId,
      sessionBytes: 0, snapshots: [], screenshots: [],
    }));
    scheduleTick(generation);
  },
  stop: () => {
    generation += 1;
    if (timer) { clearTimeout(timer); timer = null; }
    const { snapshots, screenshots, startedAt, profileId } = get();
    set({ isCapturing: false, snapshots: [], screenshots: [], sessionBytes: 0 });
    if (!profileId || (snapshots.length === 0 && screenshots.length === 0)) return;
    const sessionKey = `session-${startedAt ?? Date.now()}`;
    void window.api.finalizeDebugCaptureSession({ profileId, sessionKey, snapshots, screenshots });
  },
  toggle: (profileId: string) => {
    const state = get();
    if (state.isCapturing) state.stop();
    else state.start(profileId);
  },
}));

export { useDebugCaptureStore };
