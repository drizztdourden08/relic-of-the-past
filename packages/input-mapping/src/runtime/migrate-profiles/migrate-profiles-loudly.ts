/* @layer renderer-lib @kind logic */
import type { InputProfile } from '../../controls/devices/devices.type';
import { migrateProfiles } from './migrate-profiles';

const migrateProfilesLoudly = (raw: readonly unknown[]): InputProfile[] => {
  const { profiles, failures } = migrateProfiles(raw);
  for (const failure of failures) console.error(`[controls] ${failure}`);
  return profiles;
};

export { migrateProfilesLoudly };
