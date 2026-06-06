/**
 * Typed wrapper around the per-profile tracker-state IPC. Keeps `window.api`
 * (and `any`) out of presentational component tiers — they call these instead.
 */

type TrackerStateBlob = Record<string, unknown>;

const loadTrackerStateBlob = async (profileId: string): Promise<TrackerStateBlob | null> => {
  const raw = await window.api.loadTrackerState(profileId);
  return raw && typeof raw === 'object' ? (raw as TrackerStateBlob) : null;
};

const saveTrackerStateBlob = async (profileId: string, state: TrackerStateBlob): Promise<void> => {
  await window.api.saveTrackerState(profileId, state);
};

export type { TrackerStateBlob };
export { loadTrackerStateBlob, saveTrackerStateBlob };
