/* @layer shared-game @kind logic */
import { parseCapacityProfile } from './parse-capacity-profile';
import type { CapacityProfile } from '../capacity-profile.type';
import type { RandomizerOptionsSnapshot } from '../../options.type';

const capacityProfileFromSnapshot = (snapshot: RandomizerOptionsSnapshot): CapacityProfile =>
  parseCapacityProfile(snapshot.values).profile;

export { capacityProfileFromSnapshot };
