/* @layer shared-game @kind constants */
import { LEGACY_POND_SETTING } from './pond-profile-defaults.constants';
import { DEFAULT_SETTING_BY_ID } from './pond-settings-by-id.constants';
import { pondProfilesOf } from './pond-profiles-of';
import type { PondProfiles } from '../pond-profiles.type';

const LEGACY_POND_PROFILES: PondProfiles = pondProfilesOf(() => LEGACY_POND_SETTING);

const DEFAULT_POND_PROFILES: PondProfiles = pondProfilesOf((id) => DEFAULT_SETTING_BY_ID[id]);

export { DEFAULT_POND_PROFILES, LEGACY_POND_PROFILES };
