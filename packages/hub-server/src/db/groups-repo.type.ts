/* @layer hub-core @kind types */
import type { Group } from '@rotp/hub-contracts';

type GroupPatch = Partial<Pick<Group, 'name' | 'discordRoleId' | 'rights'>>;

export type { GroupPatch };
