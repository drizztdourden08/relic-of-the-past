/* @layer shared-game @kind logic */
import { parsePondProfiles } from './parse-pond-profiles';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { PondProfiles } from '../pond-profiles.type';

const pondProfilesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): PondProfiles =>
  parsePondProfiles(snapshot.values).profiles;

export { pondProfilesFromSnapshot };
