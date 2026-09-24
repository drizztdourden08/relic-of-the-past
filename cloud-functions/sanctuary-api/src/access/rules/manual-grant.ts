/* @layer root-config @kind logic */
/** The groups an admin put the user in by hand. */
import { knownIds } from '../membership';
import type { GroupRule } from '../access-rule.type';

const manualGroups: GroupRule = async ({ user, groups }) => knownIds(user.groupIds, groups);

export { manualGroups };
