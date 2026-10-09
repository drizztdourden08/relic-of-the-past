/* @layer renderer-lib @kind logic */
import type { Placement } from '@rotp/randomizer';
import { saveRandomizerState } from '../storage/profile-data-store';
import type { StoredPlacement } from '@rotp/randomizer';
import { PLACEMENT_SCHEMA } from '@rotp/randomizer';

const saveRandomizerPlacement = async (profileId: string, placement: Placement): Promise<void> => {
  const stored: StoredPlacement = { schema: PLACEMENT_SCHEMA, ...placement };
  await saveRandomizerState(profileId, stored);
};

export { saveRandomizerPlacement };
