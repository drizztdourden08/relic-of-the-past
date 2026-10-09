/* @layer renderer-lib @kind logic */
import { loadTrackerState } from '../storage/profile-data-store';
import type { TrackerStateBlob } from '@rotp/navigation';

const loadTrackerStateBlob = async (profileId: string): Promise<TrackerStateBlob | null> => {
  const raw = await loadTrackerState(profileId);
  return raw && typeof raw === 'object' ? (raw as TrackerStateBlob) : null;
};

export { loadTrackerStateBlob };
