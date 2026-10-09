/* @layer shared-game @kind logic */
import { POND_IDS } from '../pond-instances';
import type { PondId } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';
import type { PondProfiles } from '../pond-profiles.type';

const pondProfilesOf = (setting: (id: PondId) => PondSetting): PondProfiles =>
  Object.fromEntries(POND_IDS.map((id) => [id, setting(id)])) as PondProfiles;

export { pondProfilesOf };
