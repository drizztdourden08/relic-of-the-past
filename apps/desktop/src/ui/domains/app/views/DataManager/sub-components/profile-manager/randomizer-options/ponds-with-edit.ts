/* @layer renderer-components @kind logic */
import { CAPACITY_POND } from '@shared/randomizer/world/pond/pond-instances';
import type { PondId } from '@shared/randomizer/world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import type { PondProfiles } from '@shared/randomizer/world/pond/pond-profiles.type';

const pondsWithEdit = (
  profiles: PondProfiles, id: PondId, next: PondSetting, share: boolean,
): PondProfiles => ({ ...profiles, [share ? CAPACITY_POND.id : id]: next });

export { pondsWithEdit };
