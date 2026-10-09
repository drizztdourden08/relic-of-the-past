/* @layer hub-core @kind types */
import type { Group } from '../../../shared/hub';

type GroupPatch = Partial<Pick<Group, 'name' | 'discordRoleId' | 'rights'>>;

export type { GroupPatch };
