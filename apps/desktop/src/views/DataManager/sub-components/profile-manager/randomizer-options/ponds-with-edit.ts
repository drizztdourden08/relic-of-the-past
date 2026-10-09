/* @layer renderer-components @kind logic */
import { CAPACITY_POND } from '@rotp/randomizer';
import type { PondId, PondSetting, PondProfiles } from '@rotp/randomizer';

const pondsWithEdit = (
  profiles: PondProfiles, id: PondId, next: PondSetting, share: boolean,
): PondProfiles => ({ ...profiles, [share ? CAPACITY_POND.id : id]: next });

export { pondsWithEdit };
