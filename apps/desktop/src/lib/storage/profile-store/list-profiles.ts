/* @layer renderer-lib @kind logic */
import { listProfiles as listStoredProfiles } from '@drizztdourden08/brock-react';
import type { Profile } from '@drizztdourden08/brock-core';

const listProfiles = (): Promise<Profile[]> => listStoredProfiles();

export { listProfiles };
