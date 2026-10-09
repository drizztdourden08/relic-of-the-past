/* @layer hub-core @kind logic */
import type { Group, HubUser } from '../../../../shared/hub';
import { membershipOf } from './membership-of';

const groupsOf = (user: HubUser, groups: Group[]): Group[] => {
  const ids = membershipOf(user);
  return groups.filter((group) => ids.includes(group.id));
};

export { groupsOf };
