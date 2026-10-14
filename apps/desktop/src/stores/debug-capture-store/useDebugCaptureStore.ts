/* @layer renderer-stores @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { create } from 'zustand';
import { captureGameFrameBlob } from '@rotp/game-core';
import type { DebugCaptureStore } from './debug-capture-store.type';
import { MAX_RECORDING_MS, MAX_SNAPSHOTS, SAMPLE_INTERVAL_MS } from './debug-capture-store.constants';
import { takeSnapshot } from './take-snapshot';

let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;

const scheduleTick = (gen: number): void => {
  timer = setTimeout(() => { void tick(gen); }, SAMPLE_INTERVAL_MS);
};

const tick = async (gen: number): Promise<void> => {
  if (gen !== generation) return;
  const state = useDebugCaptureStore.getState();
  if (state.startedAt !== null && Date.now() - state.startedAt >= MAX_RECORDING_MS) {
    state.stop();
    return;
  }

  const snapshot = takeSnapshot(state.session);
  const blob = await captureGameFrameBlob();
  if (gen !== generation) return;

  const screenshots = blob
    ? [...state.screenshots, { session: state.session, capturedAt: snapshot.capturedAt, png: await blob.arrayBuffer() }]
    : state.screenshots;
  useDebugCaptureStore.setState({
    snapshots: [...state.snapshots, snapshot].slice(-MAX_SNAPSHOTS),
    screenshots,
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
  start: (profileId: string) => {
    if (get().isCapturing) return;
    generation += 1;
    set((s) => ({
      isCapturing: true, startedAt: Date.now(), session: s.session + 1, profileId,
      snapshots: [], screenshots: [],
    }));
    scheduleTick(generation);
  },
  stop: () => {
    generation += 1;
    if (timer) { clearTimeout(timer); timer = null; }
    const { snapshots, screenshots, startedAt, profileId } = get();
    set({ isCapturing: false, snapshots: [], screenshots: [] });
    if (!profileId || (snapshots.length === 0 && screenshots.length === 0)) return;
    const sessionKey = `session-${startedAt ?? Date.now()}`;
    void requireHostApi().finalizeDebugCaptureSession({ profileId, sessionKey, snapshots, screenshots });
  },
  toggle: (profileId: string) => {
    const state = get();
    if (state.isCapturing) state.stop();
    else state.start(profileId);
  },
}));

export { useDebugCaptureStore };
