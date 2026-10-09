/* @layer renderer-lib @kind logic */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { loadRandomizerState } from '../storage/profile-data-store';
import { isStoredPlacement } from './is-stored-placement';

const loadRandomizerPlacement = async (profileId: string): Promise<Placement | null> => {
  const raw = await loadRandomizerState(profileId);
  if (!isStoredPlacement(raw)) return null;
  const { schema: _schema, ...placement } = raw;
  return placement;
};

export { loadRandomizerPlacement };
