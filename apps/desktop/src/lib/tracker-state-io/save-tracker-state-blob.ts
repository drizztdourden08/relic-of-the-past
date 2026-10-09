/* @layer renderer-lib @kind logic */
import { saveTrackerState } from '../storage/profile-data-store';
import type { TrackerStateBlob } from '@rotp/navigation';

const saveTrackerStateBlob = async (profileId: string, state: TrackerStateBlob): Promise<void> => {
  await saveTrackerState(profileId, state);
};

export { saveTrackerStateBlob };
