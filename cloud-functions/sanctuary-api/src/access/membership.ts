/* @layer root-config @kind logic */
/** A person's groups: the ones an admin set by hand plus the ones their
 *  Discord roles (or the GitHub fallback) put them in. Ids of deleted groups
 *  match nothing and drop out. */
import type { Group, SanctuaryUser } from '../../../../shared/sanctuary';

const membershipOf = (user: SanctuaryUser): string[] => Array.from(new Set([...user.groupIds, ...user.roleGroupIds]));

const groupsOf = (user: SanctuaryUser, groups: Group[]): Group[] => {
  const ids = membershipOf(user);
  return groups.filter((group) => ids.includes(group.id));
};

/** The ids that name an existing group, in their original order. */
const knownIds = (ids: string[], groups: Group[]): string[] => ids.filter((id) => groups.some((group) => group.id === id));

export { membershipOf, groupsOf, knownIds };
