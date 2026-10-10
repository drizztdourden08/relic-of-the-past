/* @layer hub-core @kind logic */
import { knownIds } from '../membership';
import type { GroupRule } from '../access-rule.type';

const manualGroups: GroupRule = ({ user, groups }) => Promise.resolve(knownIds(user.groupIds, groups));

export { manualGroups };
