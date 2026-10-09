/* @layer renderer-lib @kind logic */
import type { Placement } from '@rotp/randomizer';
import { loadRandomizerState } from '../storage/profile-data-store';
import { isStoredPlacement } from '@rotp/randomizer';

const loadRandomizerPlacement = async (profileId: string): Promise<Placement | null> => {
  const raw = await loadRandomizerState(profileId);
  if (!isStoredPlacement(raw)) return null;
  const { schema: _schema, ...placement } = raw;
  return placement;
};

export { loadRandomizerPlacement };
