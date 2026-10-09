/* @layer site-kit @kind types */
import type { Group } from '@shared/hub/group-types';

type GroupChipsProps = {
  groups: readonly Pick<Group, 'id' | 'name'>[];
  manualIds: readonly string[];
  roleIds: readonly string[];
  empty?: string;
};

export type { GroupChipsProps };
