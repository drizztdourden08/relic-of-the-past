/* @layer renderer-lib @kind logic */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { saveRandomizerState } from '../storage/profile-data-store';
import type { StoredPlacement } from './randomizer-placement-io.type';
import { PLACEMENT_SCHEMA } from './randomizer-placement-io.constants';

const saveRandomizerPlacement = async (profileId: string, placement: Placement): Promise<void> => {
  const stored: StoredPlacement = { schema: PLACEMENT_SCHEMA, ...placement };
  await saveRandomizerState(profileId, stored);
};

export { saveRandomizerPlacement };
